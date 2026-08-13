import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GameProvider } from './game/store'
import { loadIndex } from './data/content'
import { setLanguageWeights } from './runtime/runner'
import './styles/app.css'

/**
 * The campaign index loads before the app mounts. It is a few hundred bytes and
 * is what tells the map which missions exist — so it has to arrive first, but it
 * costs almost nothing.
 */
function Root() {
  const [index, setIndex] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadIndex()
      .then((data) => {
        setLanguageWeights(data.calibration?.weights)
        setIndex(data)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui', color: '#e6ecf5' }}>
        <h2>Could not load campaign content</h2>
        <p style={{ color: '#8f9cb0' }}>{error}</p>
        <p style={{ color: '#8f9cb0' }}>
          Run <code>npm run content:build</code> to generate <code>public/content/</code>, then reload.
        </p>
      </div>
    )
  }

  if (!index) {
    // The boot screen. Plain text on black was the one moment the product
    // looked unfinished, and it is the first thing anyone sees.
    return (
      <div className="boot">
        <svg className="boot-core" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="boot-ring r1" cx="60" cy="60" r="46" fill="none" strokeWidth="1.5" />
          <circle className="boot-ring r2" cx="60" cy="60" r="34" fill="none" strokeWidth="1.5" />
          <circle className="boot-ring r3" cx="60" cy="60" r="22" fill="none" strokeWidth="1.5" />
          <circle className="boot-heart" cx="60" cy="60" r="7" />
        </svg>
        <div className="boot-label">CONNECTING TO THE CORE</div>
        <div className="boot-dots"><i /><i /><i /></div>
      </div>
    )
  }

  return (
    <GameProvider catalogue={index.missions}>
      <App index={index} />
    </GameProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)