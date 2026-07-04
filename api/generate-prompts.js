import { getGeminiForUser } from './_lib/gemini.js';
import db from './_lib/db.js';
import { requireUser } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const { title, keywords: rawKeywords, productType = 'T-Shirt', style = '' } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const keywords = Array.isArray(rawKeywords) ? rawKeywords : [];
  const artStyle = (style || '').trim();

  let ai;
  try {
    ({ ai } = await getGeminiForUser(user.id));
  } catch (error) {
    console.error('Failed to load the Gemini key for this user:', error.message);
    return res.status(500).json({ error: 'Failed to load your API key settings. Please try again.' });
  }
  if (!ai) {
    return res.status(500).json({ error: 'No Gemini API key is available. Add your key on the Settings page (or set GEMINI_API_KEY on the server).' });
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
        'INSERT INTO generation_history (user_id, trend_title, product_type, prompts, tags, titles) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          user.id,
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
}
