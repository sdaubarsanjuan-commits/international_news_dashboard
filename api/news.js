export default async function handler(req, res) {
  const region = req.query?.region || 'Global';

  const feeds = {
    Global: [
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', source: 'CNBC World' },
      { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com' },
      { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch' },
      { url: 'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines', source: 'MarketWatch' },
    ],
    Asia: [
      { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC Asia' },
      { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19832390', source: 'CNBC Asia' },
      { url: 'https://www.investing.com/rss/news_301.rss', source: 'Investing.com Asia' },
      { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch' },
    ],
    Americas: [
      { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC US' },
      { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC US' },
      { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch' },
      { url: 'https://www.investing.com/rss/news_25.rss', source: 'Investing.com Americas' },
    ],
    Europe: [
      { url: 'https://www.cnbc.com/id/19794221/device/rss/rss.html', source: 'CNBC Europe' },
      { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19794221', source: 'CNBC Europe' },
      { url: 'https://www.investing.com/rss/news_95.rss', source: 'Investing.com Europe' },
      { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch' },
    ],
    Africa: [
      { url: 'https://allafrica.com/tools/headlines/rdf/business/headlines.rdf', source: 'AllAfrica Business' },
      { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com' },
      { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch' },
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

    // Mix articles from different sources
    const bySource = results
      .filter(r => r.status === 'fulfilled' && r.value.length > 0)
      .map(r => r.value);

    let articles = [];
    const maxPerSource = 4;
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
