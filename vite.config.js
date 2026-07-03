import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // `npx vercel dev` serves /api itself (one terminal, functions + frontend on
  // one origin). This proxy only matters for the legacy two-terminal workflow:
  // plain `npm run dev` with the old Express server still on port 3000.
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
