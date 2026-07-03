require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Gemini Client
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

app.get('/api/trends', async (req, res) => {
  try {
    const seed = req.query.seed || 'General Print on Demand';
    
    if (!ai) {
      // Fallback
      return res.json([
        { id: 1, title: 'Vintage Botanical Posters', category: 'Vintage', keywords: ['vintage', 'botanical', 'poster'] },
        { id: 2, title: 'Cozy Gamer Room Decor', category: 'Gamer', keywords: ['cozy', 'gamer', 'decor'] }
      ]);
    }

    const curatorPrompt = `
      Act as an expert print-on-demand (POD) market researcher.
      Generate 10 highly profitable, aesthetic, and IP-safe micro-niches based on this seed category/keyword: "${seed}".
      Incorporate current trends if applicable (e.g. cottagecore, retro 70s, neurodivergent positivity, cozy gamer).
      DO NOT include any trademarked/copyrighted characters, movies, sports teams, or brands.
      
      Return a JSON array of objects with these exact fields:
      - title: The niche title (e.g., "Retro 70s Floral Ghosts")
      - category: A short aesthetic category (e.g., "Retro Goth")
      - keywords: An array of 3 strong long-tail keywords

      Do NOT invent search volume, demand, popularity, or competition numbers of any kind.
      ONLY return the JSON array, no extra markdown.
    `;
    
    let text = null;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: curatorPrompt,
      });
      text = response.text;
    } catch (e) {
      console.warn('gemini-2.5-pro failed, falling back to gemini-2.5-flash:', e.message);
      try {
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: curatorPrompt,
        });
        text = fallbackResp.text;
      } catch (err2) {
        console.warn('gemini-2.5-flash failed, using offline fallback:', err2.message);
      }
    }
    
    let niches = [];
    if (text) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      niches = JSON.parse(text);
    } else {
      // Offline Fallback Data
      niches = [
        { title: "Retro 70s Floral Ghosts", category: "Retro Goth", keywords: ["retro 70s halloween", "floral ghost shirt", "groovy halloween aesthetic"] },
        { title: "Cozy Gamer Coffee Club", category: "Cozy Gamer", keywords: ["cozy gamer girl", "coffee and games", "aesthetic gaming desk"] },
        { title: "Neurospicy & Thriving", category: "Mental Health", keywords: ["neurodivergent pride", "adhd aesthetic", "autism acceptance"] },
        { title: "Dark Academia Bookworm", category: "Dark Academia", keywords: ["dark academia aesthetic", "book lover gift", "classic literature quotes"] },
        { title: "Pastel Goth Tarot", category: "Pastel Goth", keywords: ["pastel goth tarot card", "cute creepy aesthetic", "witchy pastel"] }
      ];
    }
    
    niches = niches.map((niche, index) => ({
      id: index + 1,
      ...niche
    }));
    
    res.json(niches);
  } catch (error) {
    console.error('Error generating niches:', error);
    res.status(500).json({ error: 'Failed to generate niches via AI' });
  }
});

// 2. Generate AI Prompts, Tags, Title & Save to DB
app.post('/api/generate-prompts', async (req, res) => {
  const { title, keywords, productType = 'T-Shirt', style = '' } = req.body;
  const artStyle = (style || '').trim();
  
  if (!ai) {
    return res.status(401).json({ error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to server/.env' });
  }

  try {
    // Live Google Search Trademark Check
    const safetyPrompt = `
      Perform a web search to determine if the phrase "${title}" is a registered trademark, a copyrighted character, a public figure/celebrity, a sports team, or a protected brand name.
      Respond with exactly one word: "SAFE" if it is generic and safe to use in commercial print-on-demand designs, or "UNSAFE" if it is trademarked/copyrighted/protected.
    `;
    
    // Fail CLOSED: only an explicit SAFE/UNSAFE verdict counts. A call that
    // errors OR succeeds with empty/hedging text yields no verdict; without a
    // verdict generation is blocked (this is the product's legal guardrail).
    // Note: 'UNSAFE'.includes('SAFE') is true, so includes('SAFE') accepts
    // either explicit verdict.
    let isUnsafe = false;
    let safetyChecked = false;
    try {
      const safetyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: safetyPrompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      const safetyText = (safetyResponse.text || '').toUpperCase();
      isUnsafe = safetyText.includes('UNSAFE');
      safetyChecked = safetyText.includes('SAFE');
    } catch (e) {
      console.warn('Safety check Pro failed, falling back to Flash:', e.message);
    }
    if (!safetyChecked) {
      try {
        const safetyFallback = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: safetyPrompt
        });
        const safetyText = (safetyFallback.text || '').toUpperCase();
        isUnsafe = safetyText.includes('UNSAFE');
        safetyChecked = safetyText.includes('SAFE');
      } catch (err2) {
        console.warn('Safety check Flash failed too:', err2.message);
      }
    }
    
    if (!safetyChecked) {
      return res.status(503).json({ error: 'The trademark safety check is temporarily unavailable (AI provider error). Generation is blocked until the check can run - please try again in a moment.' });
    }

    if (isUnsafe) {
      return res.status(403).json({ error: `Warning: '${title}' is a protected trademark, copyright, or public figure. Generation blocked for your safety.` });
    }

    const promptInstructions = `
      Act as an expert AI image prompt engineer and Etsy SEO specialist.
      I have a trending POD niche: "${title}".
      Top keywords: ${keywords.join(', ')}.
      Target Product Type: ${productType}.
      ${artStyle ? `Art Style: render EVERY prompt in a "${artStyle}" art style. This style must be explicitly and clearly reflected in the wording of each prompt.` : ''}

      Please generate:
      1. 3 highly detailed, creative, and commercial-ready image generation prompts (Midjourney/DALL-E) for this niche, specifically tailored to make a good design for a ${productType}${artStyle ? ` in a ${artStyle} art style` : ''}. CRITICAL: NO copyrighted/trademarked characters or brands.
      2. 13 SEO-optimized Etsy tags (comma-separated or array of strings, max 20 chars each if possible), targeted for a ${productType} listing.
      3. 2 highly optimized Etsy product titles (using long-tail keywords), targeted for a ${productType} listing.

      Format the output as a JSON object exactly like this:
      {
        "prompts": ["Prompt 1", "Prompt 2", "Prompt 3"],
        "tags": ["tag1", "tag2"],
        "titles": ["Optimized Product Title 1", "Optimized Product Title 2"]
      }
      ONLY output the JSON object, no markdown formatting.
    `;
    
    let text = null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: promptInstructions,
      });
      text = response.text;
    } catch (e) {
      console.warn('Generation Pro failed, falling back to Flash:', e.message);
      try {
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptInstructions,
        });
        text = fallbackResp.text;
      } catch (err2) {
        console.warn('Generation Flash failed, using offline fallback:', err2.message);
      }
    }
    
    let generatedData;
    if (text) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      generatedData = JSON.parse(text);
    } else {
      // Offline Fallback Data
      const styleTag = artStyle ? `${artStyle} style ` : '';
      generatedData = {
        prompts: [
          `A highly aesthetic ${styleTag}${productType} design for ${title}, vibrant colors, isolated on white background.`,
          `Trending ${styleTag || 'minimalist '}${productType} graphic featuring ${keywords[0]}, clean lines, white background.`,
          `Detailed ${styleTag || 'vintage style '}illustration for ${title}, perfect for a ${productType}, isolated on white.`
        ],
        tags: ["aesthetic", "trending", "gift idea", ...keywords.slice(0, 10)],
        titles: [
          `${title} ${productType} - Trending Aesthetic Design`,
          `Unique ${title} Graphic ${productType} - Perfect Gift`
        ]
      };
    }
    
    // Auto-log every generated package to History (distinct from manually-saved packages).
    try {
      await db.query(
        'INSERT INTO generation_history (trend_title, product_type, prompts, tags, titles) VALUES ($1, $2, $3, $4, $5)',
        [
          title,
          productType,
          JSON.stringify(generatedData.prompts),
          JSON.stringify(generatedData.tags),
          JSON.stringify(generatedData.titles)
        ]
      );
    } catch (logErr) {
      console.warn('Failed to log generation to history:', logErr.message);
    }

    res.json(generatedData);
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate prompts via Gemini' });
  }
});

// 2b. Negative Prompt Generator (context-specific, NOT a generic exclusion list)
app.post('/api/negative-prompt', async (req, res) => {
  const { context = '', title = '', style = '' } = req.body;
  const notes = (context || '').trim();

  if (!notes) {
    return res.status(400).json({ error: 'Enter your style, inspiration, or notes so the negative prompt can be tailored to it.' });
  }

  if (!ai) {
    return res.status(401).json({ error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to server/.env' });
  }

  try {
    const negInstructions = `
      Act as an expert AI image prompt engineer.
      A print-on-demand designer described the style, inspiration, and notes for a design they want to make:
      """
      ${notes}
      """
      ${title ? `The design is for this niche: "${title}".` : ''}
      ${(style || '').trim() ? `The chosen art style is: "${(style || '').trim()}".` : ''}

      Write ONE negative prompt: a comma-separated list of things to EXCLUDE that would specifically ruin or contradict THIS described style and intent.
      Tailor every exclusion to counter the specific context above. Do NOT return a generic catch-all list.
      For example, if they want clean flat vector art, exclude photorealism, gradients, 3D renders, and busy backgrounds; if they want soft watercolor, exclude hard vector edges, neon, and heavy black outlines.
      You may add a few universal print-quality exclusions (blurry, low resolution, watermark, extra limbs, distorted text), but the bulk must be specific to the context.

      Return ONLY the comma-separated negative prompt text. No preamble, no markdown, no surrounding quotes, no explanation.
    `;

    let text = null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: negInstructions,
      });
      text = response.text;
    } catch (e) {
      console.warn('Negative prompt Pro failed, falling back to Flash:', e.message);
      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: negInstructions,
      });
      text = fallbackResp.text;
    }

    const negativePrompt = (text || '')
      .replace(/```/g, '')
      .replace(/^\s*negative prompt:?\s*/i, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    if (!negativePrompt) {
      return res.status(500).json({ error: 'The AI returned an empty negative prompt. Please try again.' });
    }

    res.json({ negativePrompt });
  } catch (error) {
    console.error('Negative Prompt Error:', error);
    res.status(500).json({ error: 'Failed to generate negative prompt via Gemini' });
  }
});

// 3. Saved Packages
app.get('/api/favorite-packages', async (req, res) => {
  try {
    // jsonb columns come back as parsed arrays; no JSON.parse step needed.
    const { rows } = await db.query(
      'SELECT id, trend_title, product_type, prompts, tags, titles, created_at FROM favorite_packages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch saved packages:', error.message);
    res.status(500).json({ error: 'Failed to fetch saved packages' });
  }
});

app.post('/api/favorite-packages', async (req, res) => {
  const { trend_title, product_type, generatedData } = req.body;
  try {
    await db.query(
      'INSERT INTO favorite_packages (trend_title, product_type, prompts, tags, titles) VALUES ($1, $2, $3, $4, $5)',
      [trend_title, product_type, JSON.stringify(generatedData.prompts), JSON.stringify(generatedData.tags), JSON.stringify(generatedData.titles)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save package:', error.message);
    res.status(500).json({ error: 'Failed to save package' });
  }
});

app.delete('/api/favorite-packages/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM favorite_packages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove package:', error.message);
    res.status(500).json({ error: 'Failed to remove package' });
  }
});

// 3b. Generation History (auto-logged on every generate-prompts call)
app.get('/api/history', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, trend_title, product_type, prompts, tags, titles, created_at FROM generation_history ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM generation_history WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove history entry:', error.message);
    res.status(500).json({ error: 'Failed to remove history entry' });
  }
});

// 4. Favorites (Niches)
app.get('/api/favorites', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, category, keywords, created_at FROM favorite_niches ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch favorites:', error.message);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', async (req, res) => {
  const { title, category, keywords } = req.body;
  try {
    // Mirrors SQLite's INSERT OR IGNORE on the (user_id, title) unique constraint.
    await db.query(
      'INSERT INTO favorite_niches (title, category, keywords) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT favorite_niches_user_title_uniq DO NOTHING',
      [title, category, JSON.stringify(keywords)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save favorite:', error.message);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

app.delete('/api/favorites/:title', async (req, res) => {
  try {
    await db.query('DELETE FROM favorite_niches WHERE title = $1', [req.params.title]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove favorite:', error.message);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
