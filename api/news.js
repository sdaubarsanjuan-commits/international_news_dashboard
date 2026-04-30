export default async function handler(req, res) {
  const region = req.query?.region || 'Global';

  const feeds = {
    Global: [
      { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/business', source: 'NBC News' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NY Times Business' },
      { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
    ],
    Asia: [
      { url: 'https://feeds.reuters.com/reuters/AsiaNews', source: 'Reuters Asia' },
      { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC Asia' },
      { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NY Times Business' },
    ],
    Americas: [
      { url: 'https://feeds.reuters.com/reuters/americasNews', source: 'Reuters Americas' },
      { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC US' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/business', source: 'NBC News' },
      { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
    ],
    Europe: [
      { url: 'https://feeds.reuters.com/reuters/europeanNews', source: 'Reuters Europe' },
      { url: 'https://www.cnbc.com/id/19794221/device/rss/rss.html', source: 'CNBC Europe' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NY Times Business' },
      { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
    ],
    Africa: [
      { url: 'https://feeds.reuters.com/reuters/AfricaNews', source: 'Reuters Africa' },
      { url: 'https://allafrica.com/tools/headlines/rdf/business/headlines.rdf', source: 'AllAfrica Business' },
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
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

        items.push({
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
          url: link.trim(),
          source,
          region,
          summary: cleanDesc || 'Click to read the full story.',
          time: timeAgo,
          paywall: false,
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
