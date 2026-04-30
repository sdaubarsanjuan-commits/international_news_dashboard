import { useState, useEffect, useCallback } from 'react'

const REGIONS = ['Global', 'Asia', 'Americas', 'Europe', 'Africa']

const SOURCE_COLORS = {
  'AP':           { bg: '#fff3e8', text: '#8a3a00', dot: '#d06020' },
  'Reuters':      { bg: '#e8f0fb', text: '#1a4f8a', dot: '#2563b0' },
  'Bloomberg':    { bg: '#fffbe8', text: '#6a5000', dot: '#b08800' },
  'BBC':          { bg: '#fce8e8', text: '#8a1a1a', dot: '#cc3333' },
  'The Guardian': { bg: '#e8f7ee', text: '#1a5a30', dot: '#2a8a48' },
  'Al Jazeera':   { bg: '#fff8e8', text: '#7a4a00', dot: '#c07800' },
  'NPR':          { bg: '#f0e8fb', text: '#4a1a8a', dot: '#7a3ab0' },
  'France 24':    { bg: '#e8ecfb', text: '#1a2a8a', dot: '#3a50c0' },
  'DW News':      { bg: '#e8f7fb', text: '#0a4a5a', dot: '#0a7a9a' },
}

function getSourceStyle(source) {
  return SOURCE_COLORS[source] || { bg: '#f0f0f0', text: '#444444', dot: '#888888' }
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
        animationDelay: `${index * 0.04}s`,
        display: 'block',
        background: '#ffffff',
        border: `1px solid ${hovered ? '#2563b0' : '#d0daea'}`,
        borderRadius: '12px',
        padding: '1.25rem',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 4px 20px rgba(26,79,138,0.12)'
          : '0 1px 4px rgba(26,79,138,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          padding: '3px 10px',
          borderRadius: '20px',
          background: style.bg,
          color: style.text,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block', flexShrink: 0 }} />
          {article.source}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {article.paywall && (
            <span style={{ fontSize: '10px', color: '#cc3333', border: '1px solid #cc3333', padding: '2px 6px', borderRadius: '4px' }}>
              Paywall
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#7a90b0' }}>{article.time}</span>
        </div>
      </div>

      {/* Headline */}
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '15px',
        fontWeight: 600,
        lineHeight: 1.45,
        color: '#1a4f8a',
        marginBottom: '0.5rem',
      }}>
        {article.title}
      </h3>

      {/* Summary */}
      <p style={{
        fontSize: '13px',
        color: '#3a5070',
        lineHeight: 1.6,
        marginBottom: '0.75rem',
      }}>
        {article.summary}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '11px',
          color: '#7a90b0',
          background: '#f0f4fa',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          {article.region}
        </span>
        <span style={{ fontSize: '12px', color: '#2563b0', fontWeight: 500 }}>
          Read story →
        </span>
      </div>
    </a>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '12px', gridColumn: '1/-1' }}>
      <div style={{
        width: 22, height: 22,
        border: '2px solid #d0daea',
        borderTopColor: '#2563b0',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      <span style={{ color: '#3a5070', fontSize: '14px' }}>Fetching latest headlines...</span>
    </div>
  )
}

export default function App() {
  const [region, setRegion] = useState('Global')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchNews = useCallback(async (r) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/news?region=${r}`)
      if (!res.ok) throw new Error('Failed to fetch news')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data)) throw new Error('Invalid response format')
      setArticles(data)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(region)
  }, [region, fetchNews])

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa' }}>

      {/* Header */}
      <header style={{
        background: '#1a4f8a',
        borderBottom: '3px solid #e8a020',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(26,79,138,0.2)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}>
              International Business Report
            </h1>
            <span style={{
              fontSize: '10px',
              color: '#e8a020',
              border: '1px solid #e8a020',
              padding: '2px 7px',
              borderRadius: '4px',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              LIVE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {lastUpdated && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => fetchNews(region)}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontFamily: 'var(--font-body)',
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Region tabs */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #d0daea', boxShadow: '0 1px 4px rgba(26,79,138,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '0' }}>
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: r === region ? '3px solid #2563b0' : '3px solid transparent',
                color: r === region ? '#1a4f8a' : '#7a90b0',
                padding: '0.9rem 1.25rem',
                fontSize: '13px',
                fontWeight: r === region ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'color 0.2s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main style={{ padding: '1.5rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Sub-header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '13px', color: '#7a90b0' }}>
            {loading ? 'Loading...' : `${articles.length} stories · ${region}`}
          </p>
          <p style={{ fontSize: '12px', color: '#7a90b0' }}>
            Reuters · CNBC · AP News · New York Times · AllAfrica
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '14px',
        }}>
          {loading && <Spinner />}
          {!loading && error && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#3a5070' }}>
              <p style={{ marginBottom: '1rem', color: '#cc3333' }}>Could not load headlines: {error}</p>
              <button onClick={() => fetchNews(region)} style={{
                background: '#1a4f8a',
                border: 'none',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
              }}>
                Try again
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
        background: '#ffffff',
        borderTop: '1px solid #d0daea',
        padding: '1.25rem 2rem',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#7a90b0' }}>
            International Business News · Powered by Gemini with Google Search
          </span>
          <span style={{ fontSize: '12px', color: '#7a90b0' }}>
            Refreshes daily at 6:00 AM UTC
          </span>
        </div>
      </footer>
    </div>
  )
}
