import { useState, useEffect, useCallback } from 'react'

const REGIONS = ['Global', 'Asia', 'Americas', 'Europe', 'Africa']

const SOURCE_STYLES = {
  'Reuters':              { bg: '#fff3e0', text: '#b06010', dot: '#c8922a' },
  'CNBC':                 { bg: '#fff0e8', text: '#c04010', dot: '#e05020' },
  'New York Times':       { bg: '#f0f0f0', text: '#444444', dot: '#888888' },
  'AP News':              { bg: '#fce8e8', text: '#a02020', dot: '#c03030' },
  'Bloomberg':            { bg: '#fef8e8', text: '#9a6c00', dot: '#c8922a' },
  'Financial Times':      { bg: '#fff0e0', text: '#b04800', dot: '#d06020' },
  'AllAfrica Business':   { bg: '#e8f5ee', text: '#1a5a30', dot: '#1a7a3a' },
  'AllAfrica Economy':    { bg: '#e8f5ee', text: '#1a5a30', dot: '#1a7a3a' },
  'AllAfrica Finance':    { bg: '#e8f5ee', text: '#1a5a30', dot: '#1a7a3a' },
  'AllAfrica Industry':   { bg: '#e8f5ee', text: '#1a5a30', dot: '#1a7a3a' },
}

function getSourceStyle(source) {
  return SOURCE_STYLES[source] || { bg: '#f0f4fa', text: '#5a7090', dot: '#7a90b0' }
}

function MiniChart({ seed = 1 }) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const x = i * 12
    const y = 24 - ((Math.sin(i * seed * 0.9) + Math.cos(i * 0.5)) * 8 + 12)
    return `${x},${Math.max(4, Math.min(24, y))}`
  }).join(' ')
  return (
    <svg width="84" height="28" viewBox="0 0 84 28" fill="none" style={{ opacity: 0.15 }}>
      <polyline points={pts} stroke="#c8922a" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

function NewsCard({ article, index }) {
  const style = getSourceStyle(article.source)
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 0.05}s`,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: `1px solid ${hovered ? '#c8922a' : '#d8e4f0'}`,
        borderLeft: `3px solid #c8922a`,
        borderRadius: '4px',
        padding: '1.1rem',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 4px 20px rgba(14,40,86,0.12)'
          : '0 1px 6px rgba(14,40,86,0.06)',
      }}
    >
      <div style={{ position: 'absolute', bottom: 4, right: 4 }}>
        <MiniChart seed={index + 1} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <span style={{
          fontSize: '9px', fontWeight: 600, padding: '2px 7px', borderRadius: '2px',
          background: style.bg, color: style.text,
          display: 'flex', alignItems: 'center', gap: '4px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
          {article.source}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {article.paywall && (
            <span style={{
              fontSize: '9px', color: '#c8922a', border: '1px solid #c8922a',
              padding: '1px 5px', borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Sub</span>
          )}
          <span style={{ fontSize: '10px', color: '#7a90b0' }}>{article.time}</span>
        </div>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '14px', fontWeight: 700, lineHeight: 1.4,
        color: hovered ? '#0a1e40' : '#0e2856',
        marginBottom: '0.5rem', flex: 1,
        position: 'relative', zIndex: 1,
      }}>
        {article.title}
      </h3>

      <p style={{
        fontSize: '12px', color: '#5a7090', lineHeight: 1.55,
        marginBottom: '0.75rem', position: 'relative', zIndex: 1,
      }}>
        {article.summary}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{
          fontSize: '9px', color: '#7a90b0', background: '#f0f4fa',
          padding: '2px 6px', borderRadius: '2px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {article.region}
        </span>
        <span style={{ fontSize: '11px', color: '#c8922a', fontWeight: 600 }}>Read →</span>
      </div>
    </a>
  )
}

function Ticker({ articles }) {
  if (!articles.length) return null
  const items = [...articles, ...articles]
  return (
    <div style={{ background: '#c8922a', overflow: 'hidden', padding: '5px 0' }}>
      <div style={{
        display: 'flex', whiteSpace: 'nowrap',
        animation: 'ticker 40s linear infinite', width: 'max-content',
      }}>
        {items.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '10px', fontWeight: 600, color: '#fff',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '0 24px', borderRight: '1px solid rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}>
            ◆ {a.source}: {a.title.slice(0, 60)}{a.title.length > 60 ? '...' : ''}
          </a>
        ))}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '14px', gridColumn: '1/-1' }}>
      <div style={{
        width: 22, height: 22,
        border: '2px solid #d8e4f0',
        borderTopColor: '#c8922a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      <span style={{ color: '#7a90b0', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Fetching Markets...
      </span>
    </div>
  )
}

const markets = [
  { name: 'S&P 500', val: '5,611', chg: '+0.4%', up: true },
  { name: 'NASDAQ', val: '17,843', chg: '+0.6%', up: true },
  { name: 'DOW', val: '41,218', chg: '-0.1%', up: false },
  { name: 'FTSE 100', val: '8,432', chg: '+0.3%', up: true },
  { name: 'EUR/USD', val: '1.0842', chg: '+0.2%', up: true },
  { name: 'GOLD', val: '$3,284', chg: '+0.5%', up: true },
  { name: 'OIL WTI', val: '$61.40', chg: '-0.8%', up: false },
]

export default function App() {
  const [region, setRegion] = useState('Global')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const fetchNews = useCallback(async (r) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/news?region=${r}`)
      if (!res.ok) throw new Error('Failed to fetch news')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data)) throw new Error('Invalid response')
      setArticles(data)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNews(region) }, [region, fetchNews])

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa' }}>

      {/* Markets bar */}
      <div style={{
        background: '#1a3a6a', padding: '6px 2rem',
        display: 'flex', gap: '2rem', alignItems: 'center', overflowX: 'auto',
      }}>
        {markets.map(m => (
          <div key={m.name} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.name}</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#fff' }}>{m.val}</span>
            <span style={{ fontSize: '10px', color: m.up ? '#40d878' : '#ff6060', fontWeight: 500 }}>{m.chg}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EST
        </div>
      </div>

      {/* Header */}
      <header style={{
        background: '#0e2856',
        borderBottom: '4px solid #c8922a',
        padding: '1.1rem 2rem',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 20px rgba(14,40,86,0.2)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 44, height: 44, background: '#c8922a', borderRadius: '3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>IBR</span>
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px', color: '#fff',
                letterSpacing: '3px', lineHeight: 1,
              }}>
                INTERNATIONAL BUSINESS REPORT
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                <span style={{ fontSize: '9px', color: '#c8922a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Global Markets &amp; Finance
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#40d878', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#40d878', animation: 'pulse 2s ease infinite' }} />
                  Live
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {lastUpdated && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => fetchNews(region)}
              disabled={loading}
              style={{
                background: 'transparent', border: '1px solid #c8922a',
                color: '#c8922a', padding: '7px 16px', borderRadius: '3px',
                fontSize: '11px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1, fontFamily: 'var(--font-body)',
                letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s',
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      {articles.length > 0 && <Ticker articles={articles} />}

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #d8e4f0', boxShadow: '0 1px 4px rgba(14,40,86,0.06)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex' }}>
          {REGIONS.map(r => (
            <button key={r} onClick={() => setRegion(r)} style={{
              background: 'transparent', border: 'none',
              borderBottom: r === region ? '3px solid #c8922a' : '3px solid transparent',
              color: r === region ? '#0e2856' : '#7a90b0',
              padding: '0.85rem 1.5rem', fontSize: '11px',
              fontWeight: r === region ? 600 : 400,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.2s', marginBottom: '-1px',
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 4, height: 18, background: '#c8922a', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: '#0e2856', letterSpacing: '3px' }}>
              {region.toUpperCase()} BUSINESS NEWS
            </h2>
            {!loading && (
              <span style={{ fontSize: '10px', color: '#7a90b0', background: 'rgba(14,40,86,0.06)', padding: '2px 7px', borderRadius: '2px' }}>
                {articles.length} Stories
              </span>
            )}
          </div>
          <p style={{ fontSize: '11px', color: '#7a90b0', letterSpacing: '0.04em' }}>
            Reuters · CNBC · AP News · NYT · Bloomberg · FT · AllAfrica
          </p>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(200,146,42,0.5), transparent)', marginBottom: '1.25rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {loading && <Spinner />}
          {!loading && error && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#7a90b0' }}>
              <p style={{ marginBottom: '1rem', color: '#c03030', fontSize: '13px' }}>{error}</p>
              <button onClick={() => fetchNews(region)} style={{
                background: '#0e2856', border: 'none', color: '#fff',
                padding: '10px 24px', borderRadius: '3px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '12px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Try Again</button>
            </div>
          )}
          {!loading && !error && articles.map((article, i) => (
            <NewsCard key={i} article={article} index={i} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0e2856', padding: '1.1rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, background: '#c8922a', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#fff' }}>IBR</span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
              International Business Report · Powered by RSS Feeds
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
            Refreshes Daily · 6:00 AM UTC
          </span>
        </div>
      </footer>
    </div>
  )
}
