export default async function handler(req, res) {
  const region = req.query?.region || 'Global';

  const feeds = {
    Global: [
      { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'New York Times' },
      { url: 'https://feeds.apnews.com/rss/apf-business', source: 'AP News' },
      { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg' },
      { url: 'https://www.ft.com/rss/home/uk', source: 'Financial Times' },
    ],
    Asia: [
      { url: 'https://feeds.reuters.com/reuters/AsiaNews', source: 'Reuters Asia' },
      { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC Asia' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'New York Times' },
      { url: 'https://feeds.apnews.com/rss/apf-business', source: 'AP News' },
      { url: 'https://feeds.bloomberg.com/asia/news.rss', source: 'Bloomberg Asia' },
      { url: 'https://www.ft.com/rss/home/asia-pacific', source: 'Financial Times' },
    ],
    Americas: [
      { url: 'https://feeds.reuters.com/reuters/americasNews', source: 'Reuters Americas' },
      { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC US' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'New York Times' },
      { url: 'https://feeds.apnews.com/rss/apf-business', source: 'AP News' },
      { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg' },
      { url: 'https://www.ft.com/rss/home/us', source: 'Financial Times' },
    ],
    Europe: [
      { url: 'https://feeds.reuters.com/reuters/europeanNews', source: 'Reuters Europe' },
      { url: 'https://www.cnbc.com/id/19794221/device/rss/rss.html', source: 'CNBC Europe' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'New York Times' },
      { url: 'https://feeds.apnews.com/rss/apf-business', source: 'AP News' },
      { url: 'https://feeds.bloomberg.com/europe/news.rss', source: 'Bloomberg Europe' },
      { url: 'https://www.ft.com/rss/home/europe', source: 'Financial Times' },
    ],
    Africa: [
      { url: 'https://feeds.reuters.com/reuters/AfricaNews', source: 'Reuters Africa' },
      { url: 'https://allafrica.com/tools/headlines/rdf/business/headlines.rdf', source: 'AllAfrica Business' },
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.apnews.com/rss/apf-business', source: 'AP News' },
      { url: 'https://feeds.bloomberg.com/africa/news.rss', source: 'Bloomberg Africa' },
      { url: 'https://www.ft.com/rss/home/africa', source: 'Financial Times' },
    ],
  };

  const selectedFeeds = feeds[region] || feeds.Global;

  function parseRSS(xml, source) {
    const items = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const item = match[1];
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
        ?.[1] || item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        || item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
        ?.[1] || item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      if (title && link && link.startsWith('http')) {
        let timeAgo = 'Recently';
        if (pubDate) {
          const diff = Date.now() - new Date(pubDate).getTime();
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor(diff / 60000);
          if (hours >= 24) timeAgo = `${Math.floor(hours / 24)} days ago`;
          else if (hours >= 1) timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
          else timeAgo = `${mins} minute${mins > 1 ? 's' : ''} ago`;
        }

        const cleanDesc = description
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
          .slice(0, 120);

        const isPaywall =
          source === 'New York Times' ||
          source.includes('Bloomberg') ||
          source.includes('Financial Times');

        items.push({
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
          url: link.trim(),
          source,
          region,
          summary: cleanDesc || 'Click to read the full story.',
          time: timeAgo,
          paywall: isPaywall,
        });
      }
    }
    return items;
  }

  try {
    const results = await Promise.allSettled(
      selectedFeeds.map(({ url, source }) =>
        fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
          signal: AbortSignal.timeout(8000),
        })
          .then(r => r.text())
          .then(xml => parseRSS(xml, source))
      )
    );

    const bySource = results
      .filter(r => r.status === 'fulfilled' && r.value.length > 0)
      .map(r => r.value);

    // Take up to 2 articles per source targeting 12 total
    let articles = [];
    const maxPerSource = 2;
    for (const sourceArticles of bySource) {
      articles.push(...sourceArticles.slice(0, maxPerSource));
    }
    articles = articles.slice(0, 12);

    if (articles.length === 0) {
      return res.status(500).json({ error: 'No articles found from RSS feeds' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=1800');
    return res.status(200).json(articles);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
