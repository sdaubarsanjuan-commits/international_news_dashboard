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
      { url: 'https://feeds.reuters.com/reuters/AsiaNews', source: 'Reuters' },
      { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.bloomberg.com/asia/news.rss', source: 'Bloomberg' },
      { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg' },
      { url: 'https://www.ft.com/rss/home/asia-pacific', source: 'Financial Times' },
      { url: 'https://feeds.apnews.com/rss/apf-asiapacific', source: 'AP News' },
    ],
    Americas: [
      { url: 'https://feeds.reuters.com/reuters/americasNews', source: 'Reuters' },
      { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg' },
      { url: 'https://www.ft.com/rss/home/us', source: 'Financial Times' },
      { url: 'https://feeds.apnews.com/rss/apf-business', source: 'AP News' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'New York Times' },
    ],
    Europe: [
      { url: 'https://feeds.reuters.com/reuters/europeanNews', source: 'Reuters' },
      { url: 'https://www.cnbc.com/id/19794221/device/rss/rss.html', source: 'CNBC' },
      { url: 'https://feeds.bloomberg.com/europe/news.rss', source: 'Bloomberg' },
      { url: 'https://www.ft.com/rss/home/europe', source: 'Financial Times' },
      { url: 'https://www.ft.com/rss/home/uk', source: 'Financial Times' },
      { url: 'https://feeds.apnews.com/rss/apf-europe', source: 'AP News' },
    ],
    Africa: [
      { url: 'https://feeds.reuters.com/reuters/AfricaNews', source: 'Reuters' },
      { url: 'https://allafrica.com/tools/headlines/rdf/business/headlines.rdf', source: 'AllAfrica Business' },
      { url: 'https://feeds.apnews.com/rss/apf-africa', source: 'AP News' },
      { url: 'https://allafrica.com/tools/headlines/rdf/economy/headlines.rdf', source: 'AllAfrica Economy' },
      { url: 'https://allafrica.com/tools/headlines/rdf/finance/headlines.rdf', source: 'AllAfrica Finance' },
      { url: 'https://allafrica.com/tools/headlines/rdf/industry/headlines.rdf', source: 'AllAfrica Industry' },
    ],
  };

  const selectedFeeds = feeds[region] || feeds.Global;

  const regionKeywords = {
    Asia: ['asia', 'china', 'japan', 'korea', 'india', 'singapore', 'hong kong', 'taiwan', 'indonesia', 'thailand', 'vietnam', 'malaysia', 'philippines', 'pacific', 'tokyo', 'beijing', 'shanghai', 'asian', 'nikkei', 'yen', 'yuan', 'rupee', 'kospi'],
    Americas: ['us', 'usa', 'america', 'canada', 'brazil', 'mexico', 'latin', 'wall street', 'federal reserve', 'nasdaq', 'dow', 'new york', 'washington', 'tariff', 's&p', 'dollar', 'treasury', 'sec', 'fed'],
    Europe: ['europe', 'european', 'eu', 'uk', 'britain', 'france', 'germany', 'italy', 'spain', 'london', 'paris', 'berlin', 'ecb', 'euro', 'brexit', 'brussels', 'pound', 'ftse', 'dax', 'dutch', 'swiss', 'nordic'],
    Africa: ['africa', 'african', 'nigeria', 'kenya', 'south africa', 'ghana', 'ethiopia', 'egypt', 'morocco', 'tanzania', 'uganda', 'zimbabwe', 'nairobi', 'lagos', 'cairo', 'rand', 'naira', 'johannesburg', 'angola', 'mozambique', 'rwanda', 'senegal', 'ivory coast', 'cameroon', 'botswana', 'zambia', 'mali', 'niger', 'sudan', 'tunisia', 'algeria', 'libya', 'sub-saharan', 'east africa', 'west africa', 'southern africa'],
  };

  function isRegionRelevant(title, summary, region) {
    if (region === 'Global') return true;
    const keywords = regionKeywords[region];
    if (!keywords) return true;
    const text = (title + ' ' + summary).toLowerCase();
    return keywords.some(kw => text.includes(kw));
  }

  function parseRSS(xml, source, region) {
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
        const cleanDesc = description
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
          .slice(0, 120);

        const cleanTitle = title
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .trim();

        if (!isRegionRelevant(cleanTitle, cleanDesc, region)) continue;

        let timeAgo = 'Recently';
        if (pubDate) {
          const diff = Date.now() - new Date(pubDate).getTime();
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor(diff / 60000);
          if (hours >= 24) timeAgo = `${Math.floor(hours / 24)} days ago`;
          else if (hours >= 1) timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
          else timeAgo = `${mins} minute${mins > 1 ? 's' : ''} ago`;
        }

        const isPaywall =
          source === 'New York Times' ||
          source.includes('Bloomberg') ||
          source.includes('Financial Times');

        items.push({
          title: cleanTitle,
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
          .then(xml => parseRSS(xml, source, region))
      )
    );

    const bySource = results
      .filter(r => r.status === 'fulfilled' && r.value.length > 0)
      .map(r => r.value);

    // Take up to 2 articles per feed, targeting 12 total
    let articles = [];
    const maxPerFeed = 2;
    for (const sourceArticles of bySource) {
      articles.push(...sourceArticles.slice(0, maxPerFeed));
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
