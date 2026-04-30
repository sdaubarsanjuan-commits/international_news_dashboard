import { useState, useEffect, useCallback } from 'react'

const REGIONS = ['Global', 'Asia', 'Americas', 'Europe']

const SOURCE_COLORS = {
  'AP':           { bg: '#2a1a10', text: '#e8a87c', dot: '#e8935a' },
  'Reuters':      { bg: '#0e1f2e', text: '#7ab8e8', dot: '#5aa0d8' },
  'Bloomberg':    { bg: '#1a1a10', text: '#d4cc80', dot: '#c4b840' },
  'BBC':          { bg: '#1a0e10', text: '#e87a8a', dot: '#d85a6a' },
  'The Guardian': { bg: '#0e1f18', text: '#7acca8', dot: '#4ab888' },
  'Al Jazeera':   { bg: '#1f160a', text: '#d4a050', dot: '#c08030' },
  'NPR':          { bg: '#1a0e1f', text: '#b87ae8', dot: '#a060d8' },
  'France 24':    { bg: '#0a0e1f', text: '#7a90e8', dot: '#5a70d8' },
  'DW News':      { bg: '#0e1a1a', text: '#7ad4d4', dot: '#40b8b8' },
}

function getSourceStyle(source) {
  return SOURCE_COLORS[source] || { bg: '#1a1a1a', text: '#aaaaaa', dot: '#888888' }
}

function NewsCard({ article, index }) {
  const style = getSourceStyle(article.source)
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fade-up"
      style={{
        animationDelay: `${index * 0.05}s`,
        display: 'block',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
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
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />
          {article.source}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {article.paywall && (
            <span style={{ fontSize: '10px', color: 'var(--red)', border: '1px solid var(--red)', padding: '2px 6px', borderRadius: '4px', opacity: 0.8 }}>
              Paywall
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{article.time}</span>
        </div>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '15px',
        fontWeight: 600,
        lineHeight: 1.45,
        color: 'var(--text)',
        marginBottom: '0.6rem',
      }}>
        {article.title}
      </h3>

      <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        {article.summary}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '11px',
          color: 'var(--text3)',
          background: 'var(--bg3)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          {article.region}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--accent)', opacity: 0.8 }}>
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
        width: 20, height: 20,
        border: '2px solid var(--border2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: 'var(--text2)', fontSize: '14px' }}>Fetching latest headlines...</span>
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

  const handleRegion = (r) => {
    setRegion(r)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>
            World Report
          </h1>
          <span style={{
            fontSize: '11px',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            padding: '1px 7px',
            borderRadius: '4px',
            opacity: 0.7,
            fontWeight: 500,
          }}>
            LIVE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchNews(region)}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
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
      </header>

      {/* Region tabs */}
      <div style={{
        padding: '1.25rem 2rem 0',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '0',
      }}>
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => handleRegion(r)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: r === region ? '2px solid var(--accent)' : '2px solid transparent',
              color: r === region ? 'var(--accent2)' : 'var(--text3)',
              padding: '0.5rem 1.25rem',
              fontSize: '13px',
              fontWeight: r === region ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'color 0.2s',
              marginBottom: '-1px',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main style={{ padding: '1.5rem 2rem 3rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Sub-header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            {loading ? 'Loading...' : `${articles.length} stories · ${region}`}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text3)' }}>
            Sources: AP · Reuters · BBC · Al Jazeera · Bloomberg · The Guardian · NPR
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {loading && <Spinner />}
          {!loading && error && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
              <p style={{ marginBottom: '1rem' }}>Could not load headlines: {error}</p>
              <button onClick={() => fetchNews(region)} style={{
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                color: 'var(--text)', padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
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
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
          Powered by Gemini · Grounded with Google Search
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
          Refreshes daily at 6:00 AM UTC
        </span>
      </footer>
    </div>
  )
}
