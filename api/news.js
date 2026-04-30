const SYSTEM_PROMPT = `You are an international business news aggregator. Your job is to find the latest real business and financial news headlines from around the world using Google Search, then return them as structured JSON. Focus exclusively on business, finance, economics, markets, trade, corporate news, and economic policy. Always use Search Grounding to retrieve live results. Never fabricate headlines, URLs, or publication times. Only include articles published within the last 24 hours. If a source is behind a paywall, still include it but set "paywall": true.`;

function buildUserPrompt(region) {
  const regionFilter = region && region !== 'Global'
    ? `Focus only on business and financial news from or about: ${region}. For Africa, prioritize stories about African stock exchanges, African trade, commodity exports, African Development Bank, regional economic communities, and major African corporations. Include sources like Business Day, African Business, Reuters Africa, Bloomberg Africa, and AllAfrica.`
    : 'Include business and financial stories from all regions of the world.';

  return `Find the 12 most important international BUSINESS and FINANCE news stories from the last 24 hours. Search Google News now. ${regionFilter}

Only include stories about: stock markets, company earnings, mergers and acquisitions, trade deals, economic policy, central banks, interest rates, corporate leadership changes, major business deals, GDP and economic data, commodities, currencies, tech industry business news, energy markets, and financial regulation.

Do NOT include general politics, sports, entertainment, or non-business news.

For each story return the real headline, the actual article URL, the publisher name (Bloomberg, Reuters, Financial Times, Wall Street Journal, AP, BBC Business, CNBC, Forbes, The Guardian Business, or Nikkei), the region it belongs to (Global, Asia, Americas, Europe, or Africa), a one sentence business-focused summary under 20 words, how long ago it was published, and whether it has a paywall.

Prioritize stories from: Bloomberg, Reuters, Financial Times, Wall Street Journal, CNBC, AP Business, BBC Business, Forbes, Nikkei Asia, and South China Morning Post Business.

Return only a valid JSON array with these exact fields: title, url, source, region, summary, time, paywall. No markdown, no explanation, just the raw JSON array starting with [ and ending with ].`;
}

export default async function handler(req, res) {
  const region = req.query?.region || 'Global';

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: buildUserPrompt(region) }],
            },
          ],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(500).json({ error: `Gemini error: ${data?.error?.message || 'Unknown'}` });
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();

    let articles;
    try {
      articles = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[[\s\S]*\]/);
      articles = match ? JSON.parse(match[0]) : [];
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json(articles);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
