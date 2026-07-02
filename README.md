# ImagePulse

ImagePulse is an AI-powered trend curation and prompt generation tool built specifically for Print-on-Demand (POD) sellers (Etsy, Amazon Merch, Redbubble). It discovers live internet trends, filters out legally unsafe or irrelevant topics, and generates highly detailed, commercial-ready image prompts for AI generators like Midjourney or DALL-E.

## 🚀 Features
- **AI Niche Generator:** Input a broad seed keyword and let Gemini generate 10 highly profitable, aesthetic micro-niches.
- **Product Type Optimization:** Select target products (T-Shirt, Clipart, Tumbler, etc.) to tailor the generated prompts and SEO data.
- **Full SEO & Prompt Package:** Generates 3 Midjourney prompts, 13 Etsy SEO tags, and 2 Optimized Product Titles per niche.
- **Favorites Library:** Heart your favorite generated niches to save them to a local database for future reference.
- **Saved Packages:** Save fully generated prompt and SEO packages to your local database so you never lose a winning combination.
- **Legal Safety Net:** Uses Gemini's live Google Search grounding to verify trademarks, copyrights, and public figures before generating packages.
- **History Tracker:** A built-in SQLite database saves all your generated prompt packages and favorite niches.

## 🛠️ Architecture
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (`imagepulse.db`)
- **AI:** Google Gemini API (`@google/genai`)

---

## 💻 Installation & Setup

### 1. Clone & Install Dependencies
First, install the dependencies for both the frontend and the backend.
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Add Your API Key
You must provide a Gemini API key for the AI Curator and Prompt Generator to work.
Create a `.env` file inside the `server/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Application
You will need two terminal windows running simultaneously.

**Terminal 1 (Backend):**
```bash
cd server
npm start
```
*The backend will run on `http://localhost:3000`.*

**Terminal 2 (Frontend):**
```bash
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 📖 Usage Guide
1. **Generate Niches:** Open the app and enter a broad seed (e.g., "Halloween" or "Teachers") into the AI Generator bar. The AI will generate 10 highly tailored micro-niches. (Includes offline fallbacks if the API is experiencing high demand).
2. **Favorites:** Click the Heart icon on any niche card to save it to your Favorites. Toggle between Live AI Niches and Favorites using the button at the top of the list.
3. **Generate Package:** Click on a niche, select your Target Product Type (e.g., T-Shirt, Clipart), and click "Generate Package". The backend will perform a live trademark web-search.
4. **Copy & Save:** If safe, the app will generate 2 Titles, 13 Tags, and 3 Prompts. You can copy prompts directly to your clipboard, and click "Save Package" to store the entire bundle in your database.
5. **View Saved Packages:** Toggle to the Favorites view and select "Saved Packages" to view all your previously generated and saved prompt packages.

## 📝 Developer Log
See `DEVLOG.md` for the project history, architectural decisions, and the long-term roadmap.
