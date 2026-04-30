# International News Dashboard

A live international news dashboard powered by Google Gemini AI with Search Grounding. Displays real headlines from AP, Reuters, BBC, Al Jazeera, Bloomberg, The Guardian, and NPR — filtered by Global, Asia, Americas, and Europe.

## Tech Stack
- **Frontend**: React + Vite
- **AI / News**: Google Gemini API (with Google Search Grounding)
- **Backend**: Vercel Serverless Functions
- **Hosting**: Vercel
- **CI/CD**: GitHub → Vercel auto-deploy

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/international-news-dashboard.git
cd international-news-dashboard
npm install
```

### 2. Add your environment variable
In Vercel dashboard → Project Settings → Environment Variables, add:
```
GEMINI_API_KEY = your_key_here
```

### 3. Deploy
Push to GitHub — Vercel auto-deploys on every commit.

## Local Development
```bash
npm run dev
```
Note: The `/api/news` route requires Vercel CLI for local testing:
```bash
npm i -g vercel
vercel dev
```
