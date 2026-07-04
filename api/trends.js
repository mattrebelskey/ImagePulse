import { getGeminiForUser } from './_lib/gemini.js';
import { requireUser } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Generation burns a Gemini key (the user's BYOK key when stored, house
  // key otherwise) — signed-in only.
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    const { ai } = await getGeminiForUser(user.id);
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
}
