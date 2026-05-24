# Finance Manager

A simple responsive finance tracking app built with **React + Vite + Tailwind CSS**.

## Features
- Track **income** and **expenses**
- Persistent transactions per user (localStorage)
- Archive bin (soft delete)
- CSV export
- Dark mode
- **AI Chatbot (Finance Assistant)**
  - Floating chat UI, responsive drawer
  - Chat history saved in `localStorage`
  - Optional real OpenAI responses via API key
  - Automatic finance-aware fallback if AI call fails

## AI Chatbot setup
1. Open the app
2. Click the floating **AI Chatbot** button
3. Open **Settings**
4. Paste your **OpenAI API key**
   - Stored locally in your browser: `openai_api_key`
5. Ask questions like:
   - `What's my balance?`
   - `Total income and total expenses?`
   - `Biggest expense category?`

## Run locally
```bash
npm install
npm run dev
```
Then open the shown URL (usually `http://localhost:5173/`).

## Notes / Security
If you enable real AI mode, the API key is sent from the browser to OpenAI.
This is convenient for development but **not secure** for production. For production, use a backend proxy.

