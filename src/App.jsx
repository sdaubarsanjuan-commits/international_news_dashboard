import { useState, useEffect, useCallback } from 'react'

const REGIONS = ['Global', 'Asia', 'Americas', 'Europe', 'Africa']

const SOURCE_STYLES = {
  'Reuters':            { bg: 'rgba(200,146,42,0.15)', text: '#e8b040', dot: '#c8922a' },
  'CNBC':               { bg: 'rgba(255,100,0,0.12)', text: '#ff8040', dot: '#ff6000' },
  'New York Times':     { bg: 'rgba(255,255,255,0.08)', text: '#d0c8b8', dot: '#a09888' },
  'AP News':            { bg: 'rgba(180,30,30,0.15)', text: '#e07070', dot: '#c03030' },
  'Bloomberg':          { bg: 'rgba(200,146,42,0.12)', text: '#d4a840', dot: '#b88820' },
  'Financial Times':    { bg: 'rgba(255,120,0,0.12)', text: '#f09050', dot: '#d06020' },
  'AllAfrica Business': { bg: 'rgba(30,160,80,0.12)', text: '#60c080', dot: '#208840' },
  'AllAfrica Economy':  { bg: 'rgba(30,160,80,0.10)', text: '#50b070', dot: '#187030' },
}

function getSourceStyle(source) {
  return SOURCE_STYLES[source] || { bg: 'rgba(255,255,255,0.07)', text: '#8a9ab8', dot: '#506080' }
}

// Mini SVG chart decoration
function MiniChart({ seed = 1, color = '#c8922a' }) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const x = i * 14
    const y = 28 - ((Math.sin(i * seed * 0.9) + Math.cos(i * 0.5)) * 10 + 14)
    return `${x},${Math.max(4, Math.min(28, y))}`
  }).join(' ')
  return (
    <svg width="98" height="32" viewBox="0 0 98 32" fill="none" style={{ opacity: 0.5 }}>
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <polyline points={pts + ` 98,32 0,32`} stroke="none" fill={color} fillOpacity="0.08" />
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
        animationDelay: `${index * 0.06}s`,
        display: 'flex',
        flexDirection: 'column',
        background: hovered
          ? 'linear-gradient(135deg, rgba(26,48,96,0.9), rgba(17,32,64,0.95))'
          : 'linear-gradient(135deg, rgba(17,32,64,0.7), rgba(10,22,40,0.8))',
        border: `1px solid ${hovered ? 'rgba(200,146,42,0.6)' : 'rgba(200,146,42,0.15)'}`,
        borderRadius: '4px',
        padding: '1.25rem',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,146,42,0.2)'
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Gold left border accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: hovered
          ? 'linear-gradient(180deg, var(--gold2), var(--gold))'
          : 'linear-gradient(180deg, var(--gold), transparent)',
        transition: 'all 0.25s',
      }} />

      {/* Background chart decoration */}
      <div style={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.3 }}>
        <MiniChart seed={index + 1} color="var(--gold)" />
      </div>

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: '2px',
          background: style.bg,
          color: style.text,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
          {article.source}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {article.paywall && (
            <span style={{
              fontSize: '9px', color: 'var(--gold)', border: '1px solid var(--gold)',
              padding: '2px 5px', borderRadius: '2px', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Sub
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--gray)' }}>{article.time}</span>
        </div>
      </div>

      {/* Headline */}
      <h3 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '15px',
        fontWeight: 700,
        lineHeight: 1.4,
        color: hovered ? '#ffffff' : 'var(--white)',
        marginBottom: '0.6rem',
        flex: 1,
        position: 'relative',
        zIndex: 1,
      }}>
        {article.title}
      </h3>

      {/* Summary */}
      <p style={{
        fontSize: '12px',
        color: 'var(--gray)',
        lineHeight: 1.6,
        marginBottom: '0.85rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {article.summary}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{
          fontSize: '10px',
          color: 'var(--gray)',
          background: 'rgba(255,255,255,0.05)',
          padding: '2px 7px',
          borderRadius: '2px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {article.region}
        </span>
        <span style={{
          fontSize: '11px',
          color: hovered ? 'var(--gold2)' : 'var(--gold)',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}>
          Read → 
        </span>
      </div>
    </a>
  )
}

// Animated ticker
function Ticker({ articles }) {
  if (!articles.length) return null
  const items = [...articles, ...articles]
  return (
    <div style={{
      background: 'var(--gold)',
      overflow: 'hidden',
      padding: '6px 0',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        gap: '0',
        animation: 'ticker 40s linear infinite',
        whiteSpace: 'nowrap',
        width: 'max-content',
      }}>
        {items.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--navy)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0 2rem',
              borderRight: '1px solid rgba(10,22,40,0.2)',
              flexShrink: 0,
            }}
          >
            ◆ {a.source.toUpperCase()}: {a.title.slice(0, 60)}{a.title.length > 60 ? '...' : ''}
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
        width: 24, height: 24,
        border: '2px solid rgba(200,146,42,0.2)',
        borderTopColor: 'var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      <span style={{ color: 'var(--gray)', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Fetching Markets...
      </span>
    </div>
  )
}

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

  const markets = [
    { name: 'S&P 500', val: '5,611', chg: '+0.4%', up: true },
    { name: 'NASDAQ', val: '17,843', chg: '+0.6%', up: true },
    { name: 'DOW', val: '41,218', chg: '-0.1%', up: false },
    { name: 'FTSE 100', val: '8,432', chg: '+0.3%', up: true },
    { name: 'EUR/USD', val: '1.0842', chg: '+0.2%', up: true },
    { name: 'GOLD', val: '$3,284', chg: '+0.5%', up: true },
    { name: 'OIL WTI', val: '$61.40', chg: '-0.8%', up: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>

      {/* Top markets bar */}
      <div style={{
        background: 'var(--navy2)',
        borderBottom: '1px solid var(--border)',
        padding: '6px 2rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        overflowX: 'auto',
      }}>
        {markets.map(m => (
          <div key={m.name} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.name}</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--white2)' }}>{m.val}</span>
            <span style={{ fontSize: '10px', color: m.up ? '#40b870' : '#e05050', fontWeight: 500 }}>{m.chg}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '10px', color: 'var(--gray)', letterSpacing: '0.05em' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EST
        </div>
      </div>

      {/* Main header */}
      <header style={{
        background: 'linear-gradient(180deg, var(--navy2) 0%, var(--navy) 100%)',
        borderBottom: '3px solid var(--gold)',
        padding: '1.25rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Logo mark */}
            <div style={{
              width: 44, height: 44,
              background: 'var(--gold)',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--navy)', letterSpacing: '-1px' }}>IBR</span>
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                color: 'var(--white)',
                letterSpacing: '3px',
                lineHeight: 1,
              }}>
                INTERNATIONAL BUSINESS REPORT
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                <span style={{
                  fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 500,
                }}>
                  Global Markets & Finance
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '9px', color: '#40b870', letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#40b870', animation: 'pulse 2s ease infinite' }} />
                  Live
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {lastUpdated && (
              <span style={{ fontSize: '11px', color: 'var(--gray)', letterSpacing: '0.03em' }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => fetchNews(region)}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                padding: '7px 16px',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = 'var(--gold)'; e.target.style.color = 'var(--navy)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gold)' }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* News ticker */}
      {articles.length > 0 && <Ticker articles={articles} />}

      {/* Region tabs */}
      <div style={{
        background: 'var(--navy2)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex' }}>
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: r === region ? '3px solid var(--gold)' : '3px solid transparent',
                color: r === region ? 'var(--gold)' : 'var(--gray)',
                padding: '0.85rem 1.5rem',
                fontSize: '11px',
                fontWeight: r === region ? 500 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                marginBottom: '-1px',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main style={{ padding: '1.75rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 4, height: 20, background: 'var(--gold)', borderRadius: '2px' }} />
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              color: 'var(--white)',
              letterSpacing: '3px',
            }}>
              {region.toUpperCase()} BUSINESS NEWS
            </h2>
            {!loading && (
              <span style={{
                fontSize: '10px', color: 'var(--gray)',
                background: 'rgba(255,255,255,0.05)',
                padding: '3px 8px', borderRadius: '2px',
                letterSpacing: '0.05em',
              }}>
                {articles.length} Stories
              </span>
            )}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--gray)', letterSpacing: '0.05em' }}>
            Reuters · CNBC · AP News · NYT · Bloomberg · FT · AllAfrica
          </p>
        </div>

        {/* Divider line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)', marginBottom: '1.5rem', opacity: 0.4 }} />

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px',
        }}>
          {loading && <Spinner />}
          {!loading && error && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--gray)' }}>
              <p style={{ marginBottom: '1rem', color: '#e07070', fontSize: '13px' }}>{error}</p>
              <button onClick={() => fetchNews(region)} style={{
                background: 'transparent', border: '1px solid var(--gold)',
                color: 'var(--gold)', padding: '10px 24px', borderRadius: '3px',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Try Again
              </button>
            </div>
          )}
          {!loading && !error && articles.map((article, i) => (
            <NewsCard key={i} article={article} index={i} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--navy2)',
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 2rem',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, background: 'var(--gold)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>IBR</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--gray)', letterSpacing: '0.05em' }}>
              International Business Report · Powered by RSS Feeds
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--gray)', letterSpacing: '0.05em' }}>
            Refreshes Daily · 6:00 AM UTC
          </span>
        </div>
      </footer>
    </div>
  )
}
