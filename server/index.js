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
        { id: 1, title: 'Vintage Botanical Posters', category: 'Vintage', searchVolume: '50,000+', competition: 'Low', keywords: ['vintage', 'botanical', 'poster'] },
        { id: 2, title: 'Cozy Gamer Room Decor', category: 'Gamer', searchVolume: '20,000+', competition: 'Medium', keywords: ['cozy', 'gamer', 'decor'] }
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
      - searchVolume: A string like "15,000+"
      - competition: "Low" or "Medium"
      
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
        { title: "Retro 70s Floral Ghosts", category: "Retro Goth", keywords: ["retro 70s halloween", "floral ghost shirt", "groovy halloween aesthetic"], searchVolume: "20,000+", competition: "Low" },
        { title: "Cozy Gamer Coffee Club", category: "Cozy Gamer", keywords: ["cozy gamer girl", "coffee and games", "aesthetic gaming desk"], searchVolume: "45,000+", competition: "Medium" },
        { title: "Neurospicy & Thriving", category: "Mental Health", keywords: ["neurodivergent pride", "adhd aesthetic", "autism acceptance"], searchVolume: "35,000+", competition: "Low" },
        { title: "Dark Academia Bookworm", category: "Dark Academia", keywords: ["dark academia aesthetic", "book lover gift", "classic literature quotes"], searchVolume: "60,000+", competition: "Medium" },
        { title: "Pastel Goth Tarot", category: "Pastel Goth", keywords: ["pastel goth tarot card", "cute creepy aesthetic", "witchy pastel"], searchVolume: "15,000+", competition: "Low" }
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
  const { title, keywords, productType = 'T-Shirt' } = req.body;
  
  if (!ai) {
    return res.status(401).json({ error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to server/.env' });
  }

  try {
    // Live Google Search Trademark Check
    const safetyPrompt = `
      Perform a web search to determine if the phrase "${title}" is a registered trademark, a copyrighted character, a public figure/celebrity, a sports team, or a protected brand name.
      Respond with exactly one word: "SAFE" if it is generic and safe to use in commercial print-on-demand designs, or "UNSAFE" if it is trademarked/copyrighted/protected.
    `;
    
    let isUnsafe = false;
    try {
      const safetyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: safetyPrompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      const safetyText = safetyResponse.text || '';
      isUnsafe = safetyText.toUpperCase().includes('UNSAFE');
    } catch (e) {
      console.warn('Safety check Pro failed, falling back to Flash:', e.message);
      try {
        const safetyFallback = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: safetyPrompt
        });
        const safetyText = safetyFallback.text || '';
        isUnsafe = safetyText.toUpperCase().includes('UNSAFE');
      } catch (err2) {
        console.warn('Safety check Flash failed, bypassing safety check:', err2.message);
      }
    }
    
    if (isUnsafe) {
      return res.status(403).json({ error: `Warning: '${title}' is a protected trademark, copyright, or public figure. Generation blocked for your safety.` });
    }

    const promptInstructions = `
      Act as an expert AI image prompt engineer and Etsy SEO specialist.
      I have a trending POD niche: "${title}".
      Top keywords: ${keywords.join(', ')}.
      Target Product Type: ${productType}.
      
      Please generate:
      1. 3 highly detailed, creative, and commercial-ready image generation prompts (Midjourney/DALL-E) for this niche, specifically tailored to make a good design for a ${productType}. CRITICAL: NO copyrighted/trademarked characters or brands.
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
      generatedData = {
        prompts: [
          `A highly aesthetic ${productType} design for ${title}, vibrant colors, vector style, isolated on white background.`,
          `Trending minimalist ${productType} graphic featuring ${keywords[0]}, soft pastel aesthetic, clean lines, white background.`,
          `Detailed vintage style illustration for ${title}, perfect for a ${productType}, distressed texture, isolated on white.`
        ],
        tags: ["aesthetic", "trending", "gift idea", ...keywords.slice(0, 10)],
        titles: [
          `${title} ${productType} - Trending Aesthetic Design`,
          `Unique ${title} Graphic ${productType} - Perfect Gift`
        ]
      };
    }
    
    // Prompt auto-save removed; user must manually save the package.
    res.json(generatedData);
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate prompts via Gemini' });
  }
});

// 3. Saved Packages
app.get('/api/favorite-packages', (req, res) => {
  try {
    const packages = db.prepare('SELECT * FROM favorite_packages ORDER BY created_at DESC').all();
    const parsedPackages = packages.map(p => ({
      ...p,
      prompts: JSON.parse(p.prompts_json),
      tags: JSON.parse(p.tags_json),
      titles: JSON.parse(p.titles_json)
    }));
    res.json(parsedPackages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved packages' });
  }
});

app.post('/api/favorite-packages', (req, res) => {
  const { trend_title, product_type, generatedData } = req.body;
  try {
    const insertStmt = db.prepare('INSERT INTO favorite_packages (trend_title, product_type, prompts_json, tags_json, titles_json) VALUES (?, ?, ?, ?, ?)');
    insertStmt.run(trend_title, product_type, JSON.stringify(generatedData.prompts), JSON.stringify(generatedData.tags), JSON.stringify(generatedData.titles));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save package' });
  }
});

app.delete('/api/favorite-packages/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM favorite_packages WHERE id = ?');
    deleteStmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove package' });
  }
});

// 4. Favorites (Niches)
app.get('/api/favorites', (req, res) => {
  try {
    const favs = db.prepare('SELECT * FROM favorite_niches ORDER BY created_at DESC').all();
    // Parse keywords_json back to array
    const parsedFavs = favs.map(f => ({
      ...f,
      keywords: JSON.parse(f.keywords_json)
    }));
    res.json(parsedFavs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', (req, res) => {
  const { title, category, keywords } = req.body;
  try {
    const insertStmt = db.prepare('INSERT OR IGNORE INTO favorite_niches (title, category, keywords_json) VALUES (?, ?, ?)');
    insertStmt.run(title, category, JSON.stringify(keywords));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

app.delete('/api/favorites/:title', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM favorite_niches WHERE title = ?');
    deleteStmt.run(req.params.title);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// 5. Image Proxy (Bypass client adblockers)
app.get('/api/preview-image', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) return res.status(400).send('No prompt provided');
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
    console.log(`[Proxy] Fetching: ${imageUrl}`);
    
    let response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`[Proxy] Pollinations API Error: ${response.status} ${response.statusText}. Using fallback placeholder.`);
      response = await fetch('https://placehold.co/512x512/1e293b/8b5cf6/png?text=AI+Preview+Unavailable');
    }
    
    // Pass along whatever content type the successful fetch gave us (jpeg or png)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('[Proxy] Image Proxy Error:', error);
    res.status(500).send('Error loading preview');
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
