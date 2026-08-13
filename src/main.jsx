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
    return <div style={{ padding: 40, fontFamily: 'system-ui', color: '#5d6879' }}>Connecting to the Core…</div>
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
