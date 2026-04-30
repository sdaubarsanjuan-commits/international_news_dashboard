export const config = {
  runtime: 'edge',
};
 
const SYSTEM_PROMPT = `You are an international news aggregator. Your job is to find the latest real news headlines from around the world using Google Search, then return them as structured JSON. Always use Search Grounding to retrieve live results. Never fabricate headlines, URLs, or publication times. Only include articles published within the last 24 hours. If a source is behind a paywall, still include it but set "paywall": true.`;
 
function buildUserPrompt(region) {
  const regionFilter = region && region !== 'Global'
    ? `Focus only on stories from or about: ${region}.`
    : 'Include stories from all regions of the world.';
 
  return `Find the 12 most important international news stories from the last 24 hours. Search Google News now. ${regionFilter}
 
For each story return the real headline, the actual article URL, the publisher name (AP, Reuters, BBC, Al Jazeera, Bloomberg, Guardian, NPR, or France 24), the region it belongs to (Global, Asia, Americas, or Europe), a one sentence summary under 20 words, how long ago it was published, and whether it has a paywall.
 
Prioritize stories from: AP, Reuters, BBC News, Al Jazeera, The Guardian, Bloomberg, NPR, France 24, South China Morning Post, and DW News.
 
Return only a valid JSON array with these exact fields: title, url, source, region, summary, time, paywall. No markdown, no explanation, just the raw JSON array.`;
}
 
export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region') || 'Global';
 
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
 
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const articles = JSON.parse(clean);
 
    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=3600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
 
