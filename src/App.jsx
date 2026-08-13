import { useCallback, useEffect, useRef, useState } from 'react'
import { loadMission } from './data/content'
import Landing from './components/Landing'
import CoreRestored from './components/CoreRestored'
import ZoneTransition from './components/ZoneTransition'
import MapView from './components/MapView'
import Mission from './components/Mission'
import { Briefing, Hud, ProfilePanel, ResultModal, Toasts } from './components/Overlays'
import AuthPanel from './components/AuthPanel'
import { useGame } from './game/store'
import { ACHIEVEMENTS, ITEMS } from './game/rules'
import { track, EVENTS } from './game/analytics'

/**
 * Hash routing.
 *
 * Reloading used to drop the player back on the map, which is exactly wrong
 * mid-problem — their draft survived but their place did not. The URL now names
 * the screen, so reload, browser back, and sharing a link all behave.
 *
 *   #/intro        the story page
 *   #/map          the campaign map
 *   #/level/37     a mission workspace
 *   #/complete     the ending
 *
 * No router library: this is four shapes and a hashchange listener.
 */
function readHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '')
  if (raw.startsWith('level/')) {
    const level = Number(raw.slice(6))
    if (Number.isInteger(level) && level >= 1) return { view: 'level', level }
  }
  if (raw === 'intro') return { view: 'landing' }
  if (raw === 'complete') return { view: 'complete' }
  if (raw === 'map') return { view: 'map' }
  return null
}

function writeHash(hash) {
  if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
}

export default function App({ index }) {
  const game = useGame()
  const [briefing, setBriefing] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [active, setActive] = useState(null)
  const [profile, setProfile] = useState(false)
  // New players meet the story first; returning players go straight to the map.
  const [view, setView] = useState(() => {
    const route = readHash()
    // A URL naming a screen always wins over the once-only intro flag.
    if (route) return route.view === 'level' ? 'map' : route.view
    try {
      if (localStorage.getItem('code-runner:seen-intro') === '1') return 'map'
    } catch { }
    return 'landing'
  })
  const bootRoute = useRef(readHash())
  const [auth, setAuth] = useState(false)
  const [ending, setEnding] = useState(false)
  // Offered once, after the player has something worth keeping.
  const [savePrompt, setSavePrompt] = useState(false)
  // The sector cleared most recently, so the map can show it powering up.
  const [justCleared, setJustCleared] = useState(null)
  const [gateZone, setGateZone] = useState(null)
  // The storage banner is information, not an alarm; let it be dismissed.
  const [noticeHidden, setNoticeHidden] = useState(() => {
    try { return localStorage.getItem('code-runner:hide-storage-note') === '1' } catch { return false }
  })
  const [toasts, setToasts] = useState([])
  const [result, setResult] = useState(null)

  const pushToast = useCallback((title, body, tone) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, title, body, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const handleResult = useCallback((events, outcome) => {
    for (const e of events) {
      if (e.type === 'achievement') pushToast(`Achievement — ${ACHIEVEMENTS[e.key].name}`, ACHIEVEMENTS[e.key].detail)
      if (e.type === 'item') pushToast(`${ITEMS[e.key].icon} ${ITEMS[e.key].name} acquired`, `${e.streak}-mission clean streak`)
      if (e.type === 'shield') pushToast('⬡ Streak Shield consumed', 'Your clean streak survived that failure.', 'var(--warn)')
      if (e.type === 'streak_broken') track(EVENTS.STREAK_BROKEN, { from: e.from })
      if (e.type === 'streak_broken') pushToast('Clean streak reset', `Streak of ${e.from} ended. Nothing else was lost.`, 'var(--bad)')
    }
    if (outcome?.tier && active?.milestone === 'final') {
      // The Core deserves the full sequence, not a results modal.
      setResult(null)
      setActive(null)
      setEnding(true)
      return
    }
    if (outcome?.tier) {
      setJustCleared(active.id)
      setResult({ mission: active, outcome, events })
      // Prompt to save progress once the player has actually earned something —
      // not on arrival, when they have nothing to lose and no reason to care.
      const firstClear = events.some((e) => e.type === 'clear' && e.firstClear)
      if (firstClear && game.cloudEnabled && !game.session) {
        try {
          if (localStorage.getItem('code-runner:save-prompt-seen') !== '1') setSavePrompt(true)
        } catch { setSavePrompt(true) }
      }
    }
  }, [active, pushToast])

  // A mission's full document — problem text, reference solution, generator —
  // is fetched only when the player opens it.
  const openBriefing = useCallback(async (entry) => {
    try {
      const m = await loadMission(entry.id)
      track(EVENTS.MISSION_OPENED, { mission: m.id, level: m.level })
      setBriefing(m)
    } catch (err) {
      setLoadError(err.message)
      pushToast('Could not load that mission', err.message, 'var(--bad)')
    }
  }, [pushToast])


  // Deep link: #/level/37 opens that mission directly, provided it is unlocked.
  useEffect(() => {
    const route = bootRoute.current
    bootRoute.current = null
    if (!route || route.view !== 'level') return
    const entry = game.catalogue.find((m) => m.level === route.level)
    if (!entry || !game.isUnlocked(route.level)) { setView('map'); return }
    loadMission(entry.id)
      .then((m) => { setActive(m); setView('map') })
      .catch(() => setView('map'))
    // Runs once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the URL in step with whatever is on screen.
  useEffect(() => {
    if (view === 'landing') writeHash('#/intro')
    else if (ending) writeHash('#/complete')
    else if (active) writeHash(`#/level/${active.level}`)
    else writeHash('#/map')
  }, [view, active, ending])

  // Browser back and forward.
  useEffect(() => {
    const onPop = () => {
      const route = readHash()
      if (!route) return
      if (route.view === 'level') {
        const entry = game.catalogue.find((m) => m.level === route.level)
        if (entry && game.isUnlocked(route.level)) {
          loadMission(entry.id).then(setActive).catch(() => { })
          setView('map')
          return
        }
      }
      setActive(null)
      setEnding(route.view === 'complete')
      setView(route.view === 'landing' ? 'landing' : 'map')
    }
    window.addEventListener('hashchange', onPop)
    return () => window.removeEventListener('hashchange', onPop)
  }, [game.catalogue, game.isUnlocked])

  const dismissSavePrompt = useCallback(() => {
    try { localStorage.setItem('code-runner:save-prompt-seen', '1') } catch { }
    setSavePrompt(false)
  }, [])

  return (
    <div className={`app ${game.settings.reducedMotion ? 'reduced-motion' : ''}`}>
      {view === 'landing' || noticeHidden ? null : game.cloudEnabled && game.session ? null : (
        <div className="notice">
          <span>
            {index.missions.length} of {index.totalCampaignLevels} missions published.
            Progress is saved in this browser only.
          </span>
          {game.cloudEnabled && (
            <button className="notice-action" onClick={() => setAuth(true)}>
              Sign in to keep it
            </button>
          )}
          <button className="notice-close" aria-label="Dismiss this notice"
            onClick={() => {
              try { localStorage.setItem('code-runner:hide-storage-note', '1') } catch { }
              setNoticeHidden(true)
            }}>✕</button>
        </div>
      )}

      {view !== 'landing' && (
        <Hud onOpenProfile={() => setProfile(true)} onOpenAuth={() => setAuth(true)} />
      )}

      {view === 'landing' ? (
        <Landing onEnter={() => {
          try { localStorage.setItem('code-runner:seen-intro', '1') } catch { }
          setView('map')
        }} />
      ) : active ? (
        <Mission mission={active} onExit={() => setActive(null)} onResult={handleResult} />
      ) : (
        <MapView onOpen={openBriefing} onShowIntro={() => setView('landing')}
          justCleared={justCleared} onSurgeDone={() => setJustCleared(null)} />
      )}

      {briefing && (
        <Briefing
          mission={briefing}
          onClose={() => setBriefing(null)}
          onAccept={() => { setActive(briefing); setBriefing(null) }}
        />
      )}

      {result && (
        <ResultModal
          {...result}
          onStay={() => setResult(null)}
          onNext={() => {
            // If that clear finished a zone, the gate opens before the map.
            const zone = result.mission.zone
            const zoneDone = game.catalogue
              .filter((m) => m.zone === zone)
              .every((m) => game.progress[m.id]?.bestTier)
            setResult(null)
            setActive(null)
            if (zoneDone) setGateZone(zone)
          }}
        />
      )}

      {profile && <ProfilePanel onClose={() => setProfile(false)} />}

      {auth && <AuthPanel onClose={() => setAuth(false)} />}

      {view === 'map' && !active && game.highestCleared >= index.totalCampaignLevels && (
        <button className="btn ending-replay" onClick={() => setEnding(true)}>
          ◆ Replay the ending
        </button>
      )}

      {gateZone && <ZoneTransition zone={gateZone} onDone={() => setGateZone(null)} />}

      {ending && <CoreRestored onClose={() => setEnding(false)} />}

      {savePrompt && !result && !ending && (
        <div className="save-prompt" role="dialog" aria-label="Keep your progress">
          <div className="save-prompt-body">
            <b>Keep your progress</b>
            <p>
              Level {game.highestCleared} is saved in this browser only — clearing your browsing
              data would erase it. Create a free account and it follows you to any device.
              Everything you have already earned comes with you.
            </p>
          </div>
          <div className="save-prompt-actions">
            <button className="btn btn-ghost" onClick={dismissSavePrompt}>Not now</button>
            <button className="btn btn-primary" onClick={() => { dismissSavePrompt(); setAuth(true) }}>
              Save my progress
            </button>
          </div>
        </div>
      )}

      <Toasts items={toasts} />
    </div>
  )
}