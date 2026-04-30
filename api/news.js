export default async function handler(req, res) {
  const region = req.query?.region || 'Global';

  // Free RSS feeds by region - all real, active sources
  const feeds = {
    Global: [
      { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', source: 'Wall Street Journal' },
      { url: 'https://rss.app/feeds/AP-business.xml', source: 'AP Business' },
    ],
    Asia: [
      { url: 'https://feeds.reuters.com/reuters/AsiaNews', source: 'Reuters Asia' },
      { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
      { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC Asia' },
    ],
    Americas: [
      { url: 'https://feeds.reuters.com/reuters/americasNews', source: 'Reuters Americas' },
      { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC US' },
      { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC Americas' },
    ],
    Europe: [
      { url: 'https://feeds.reuters.com/reuters/europeanNews', source: 'Reuters Europe' },
      { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
      { url: 'https://www.cnbc.com/id/19794221/device/rss/rss.html', source: 'CNBC Europe' },
    ],
    Africa: [
      { url: 'https://feeds.reuters.com/reuters/AfricaNews', source: 'Reuters Africa' },
      { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
      { url: 'https://allafrica.com/tools/headlines/rdf/business/headlines.rdf', source: 'AllAfrica Business' },
    ],
  };

  const selectedFeeds = feeds[region] || feeds.Global;

  function parseRSS(xml, source) {
    const items = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const item = match[1];
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
        ?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        || item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
        ?.[1] || item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      if (title && link && link.startsWith('http')) {
        // Calculate time ago
        let timeAgo = 'Recently';
        if (pubDate) {
          const diff = Date.now() - new Date(pubDate).getTime();
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor(diff / 60000);
          if (hours >= 24) timeAgo = `${Math.floor(hours / 24)} days ago`;
          else if (hours >= 1) timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
          else timeAgo = `${mins} minute${mins > 1 ? 's' : ''} ago`;
        }

        // Clean up description
        const cleanDesc = description
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
          .slice(0, 120);

        items.push({
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
          url: link.trim(),
          source,
          region,
          summary: cleanDesc || 'Click to read the full story.',
          time: timeAgo,
          paywall: source.includes('Wall Street Journal') || source.includes('Financial Times'),
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

    let articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .slice(0, 12);

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
