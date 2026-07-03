import { GoogleGenAI } from '@google/genai';

// Shared Gemini client; null when GEMINI_API_KEY is missing so each route can
// serve its fallback (same behavior as the Express server had).
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export default ai;
