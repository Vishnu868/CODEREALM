import { Component } from 'react'

/**
 * Error boundary.
 *
 * A React component that throws during render unmounts the whole tree, which
 * renders as a completely blank page with nothing on screen to explain it. That
 * is the worst possible failure mode: it looks identical whether the cause is a
 * missing file, a bad deploy, or a one-line typo.
 *
 * This catches the throw and shows the actual message and stack, so a problem
 * can be read off the screen instead of hunted for in DevTools.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    // Still log it, so the console has the full trace with source maps.
    console.error('CodeRealm crashed:', error, info)
  }

  render() {
    const { error, info } = this.state
    if (!error) return this.props.children

    const detail = [
      error?.message || String(error),
      error?.stack || '',
      info?.componentStack ? `\nComponent stack:${info.componentStack}` : ''
    ].join('\n')

    return (
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.eyebrow}>SYSTEM FAULT</div>
          <h1 style={S.title}>Something threw during render</h1>
          <p style={S.lede}>
            The page is blank because a component crashed. The message below says which one.
          </p>

          <pre style={S.pre}>{detail}</pre>

          <div style={S.actions}>
            <button style={S.btn} onClick={() => window.location.reload()}>Reload</button>
            <button
              style={S.btn}
              onClick={() => navigator.clipboard?.writeText(detail)}
            >
              Copy the error
            </button>
            <button
              style={{ ...S.btn, ...S.danger }}
              onClick={() => {
                // Corrupt saved progress can also cause this; offer the escape.
                try {
                  localStorage.removeItem('code-runner:prototype-save:v1')
                } catch { }
                window.location.hash = '#/map'
                window.location.reload()
              }}
            >
              Clear local save and reload
            </button>
          </div>
        </div>
      </div>
    )
  }
}

// Inline styles on purpose: if the stylesheet is what failed, this still renders.
const S = {
  wrap: {
    minHeight: '100vh', background: '#0a0d12', color: '#e6ecf5',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
  },
  card: {
    maxWidth: 780, width: '100%', background: '#111620',
    border: '1px solid #232c3b', borderLeft: '3px solid #ff7a7a',
    borderRadius: 12, padding: '26px 28px'
  },
  eyebrow: {
    fontFamily: 'ui-monospace, monospace', fontSize: 11,
    letterSpacing: '.22em', color: '#ff7a7a'
  },
  title: { fontSize: 22, margin: '10px 0 0' },
  lede: { color: '#8f9cb0', fontSize: 14.5, lineHeight: 1.7, marginTop: 10 },
  pre: {
    marginTop: 18, padding: 14, borderRadius: 8,
    background: '#0a0d12', border: '1px solid #232c3b',
    color: '#ff9d9d', fontFamily: 'ui-monospace, monospace',
    fontSize: 12.5, lineHeight: 1.6, whiteSpace: 'pre-wrap',
    overflowX: 'auto', maxHeight: 340
  },
  actions: { display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' },
  btn: {
    background: '#151b26', border: '1px solid #232c3b', color: '#e6ecf5',
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', font: 'inherit', fontSize: 14
  },
  danger: { borderColor: '#66272c', color: '#ff9d9d' }
}
