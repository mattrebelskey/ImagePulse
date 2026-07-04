import ai from './_lib/gemini.js';
import { requireUser } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const { context = '', title = '', style = '' } = req.body || {};
  const notes = (context || '').trim();

  if (!notes) {
    return res.status(400).json({ error: 'Enter your style, inspiration, or notes so the negative prompt can be tailored to it.' });
  }

  if (!ai) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server. Set GEMINI_API_KEY in the environment (root .env for vercel dev, Vercel project env vars once deployed).' });
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
}
