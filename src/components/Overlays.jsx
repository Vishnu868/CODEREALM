import { useEffect, useRef, useState } from 'react'
import { useGame } from '../game/store'
import { ACHIEVEMENTS, ITEMS, TIER_LABEL, computeMastery, playerLevelFor } from '../game/rules'

const TOTAL_CAMPAIGN_LEVELS = 100

/** Counts a number up when it changes, rather than snapping to the new value. */
function useCountUp(value, reduced) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (reduced || value === from.current) { setShown(value); from.current = value; return }
    const start = from.current
    const delta = value - start
    const began = performance.now()
    const DURATION = 900
    let frame
    const tick = (now) => {
      const t = Math.min(1, (now - began) / DURATION)
      // Ease out, so it decelerates into the final number.
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(start + delta * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, reduced])
  return shown
}

/**
 * The HUD.
 *
 * Everything here used to be static text that jumped to a new value. It now
 * behaves like a game readout: XP counts up, the bar fills, a level-up flashes,
 * and the streak charges toward its next reward instead of being a bare number.
 */
export function Hud({ onOpenProfile, onOpenAuth }) {
  const { xp, streak, highestCleared, cloudEnabled, session, syncing, settings } = useGame()
  const reduced = settings.reducedMotion
  const { level, into, need } = playerLevelFor(xp)
  const shownXp = useCountUp(xp, reduced)

  // Flash the level chip when the player level actually changes.
  const [levelled, setLevelled] = useState(false)
  const prevLevel = useRef(level)
  useEffect(() => {
    if (level !== prevLevel.current) {
      prevLevel.current = level
      if (reduced) return
      setLevelled(true)
      const t = setTimeout(() => setLevelled(false), 1600)
      return () => clearTimeout(t)
    }
  }, [level, reduced])

  // The streak charges toward its next reward: 3, 5, 10, 15, 20.
  const marks = [3, 5, 10, 15, 20]
  const nextMark = marks.find((m) => m > streak) ?? null
  const prevMark = [...marks].reverse().find((m) => m <= streak) ?? 0
  const chargeSpan = nextMark ? nextMark - prevMark : 1
  const charge = nextMark ? ((streak - prevMark) / chargeSpan) * 100 : 100

  const campaignPct = Math.round((highestCleared / 100) * 100)

  return (
    <header className="hud">
      <div className="hud-brand">
        <strong>Code Runner</strong>
        <span>Restore the Core</span>
      </div>
      <div className="hud-spacer" />

      {/* Campaign progress as a ring rather than a fraction. */}
      <div className="hud-stat hud-campaign">
        <small>Campaign</small>
        <div className="campaign-row">
          <svg className="ring" viewBox="0 0 36 36" aria-hidden="true">
            <circle className="ring-track" cx="18" cy="18" r="15" fill="none" strokeWidth="3" />
            <circle className="ring-fill" cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                    strokeDasharray={`${campaignPct * 0.942} 999`} strokeLinecap="round" />
          </svg>
          <b>{highestCleared} / 100</b>
        </div>
      </div>

      <div className="hud-stat">
        <small>
          Player level <span className={`level-chip ${levelled ? 'levelled' : ''}`}>{level}</span>
        </small>
        <b className="xp-value">{shownXp.toLocaleString()} XP</b>
        <div className="xpbar" aria-label={`${into} of ${need} XP to next level`}>
          <i style={{ width: `${Math.round((into / need) * 100)}%` }} />
        </div>
      </div>

      <div className={`hud-stat streak-stat ${streak >= 3 ? 'hot' : ''}`}>
        <small>Clean streak</small>
        <b className="streak-value">
          {streak}
          {streak >= 3 && <span className="streak-flame" aria-hidden="true">▲</span>}
        </b>
        <div className="chargebar" aria-label={nextMark ? `${nextMark - streak} to the next reward` : 'Maximum streak'}>
          <i style={{ width: `${charge}%` }} />
        </div>
      </div>

      {cloudEnabled && (
        session
          ? <span className={`sync-chip ${syncing ? 'busy' : ''}`} title={session.user.email}>
              {syncing ? 'Syncing…' : 'Synced'}
            </span>
          : <button className="btn" onClick={onOpenAuth}>Sign in</button>
      )}
      <button className="btn" onClick={onOpenProfile}>Profile</button>
    </header>
  )
}

export function Briefing({ mission, onAccept, onClose }) {
  const { progress, settings } = useGame()
  const saved = progress[mission.id]
  const wire = useTransmission(mission.story.briefing, !settings.reducedMotion)
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`Briefing for level ${mission.level}`}>
      <div className="modal modal-brief">
        <div className="wire-bar" aria-hidden="true"><i /></div>
        <div className="eyebrow">
          {mission.milestone === 'final'
            ? 'THE CORE · Final transmission'
            : mission.milestone
              ? `Priority transmission · Sector ${mission.level}`
              : `Incoming transmission · Sector ${mission.level}`}
        </div>
        <h2>{mission.title}</h2>
        <p className={`story story-wire ${wire.done ? 'done' : ''}`} onClick={wire.skip}>
          {wire.text}
          {!wire.done && <span className="caret" aria-hidden="true" />}
        </p>
        <div className="meta-grid">
          <div className="meta"><small>Skill practised</small><b>{mission.topic}</b></div>
          <div className="meta"><small>Difficulty</small><b>{'◆'.repeat(mission.difficulty)}</b></div>
          <div className="meta"><small>Target complexity</small><b>{mission.expectedComplexity}</b></div>
          <div className="meta"><small>On success</small><b>Level {mission.level + 1} unlocks</b></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
          Failing costs nothing but your clean streak — XP, unlocked levels and items are never taken away.
          {saved?.bestTier && ` Already cleared at ${TIER_LABEL[saved.bestTier]}; replay to improve the rating.`}
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Not yet</button>
          <button className="btn btn-primary" onClick={onAccept}>Accept mission</button>
        </div>
      </div>
    </div>
  )
}

/**
 * The mission-complete sequence.
 *
 * A repair should feel like a repair. Rather than dropping a modal of numbers,
 * the sector powers up in stages: the relay reconnects, the story resolves, the
 * rewards land one at a time, and only then does the Continue button arrive.
 *
 * Roughly two seconds, and skippable by clicking anywhere. Reduced motion jumps
 * straight to the finished state.
 */
export function ResultModal({ mission, outcome, events, onNext, onStay }) {
  const game = useGame()
  const clear = events.find((e) => e.type === 'clear')
  const reduced = game.settings.reducedMotion
  const [step, setStep] = useState(reduced ? 4 : 0)

  useEffect(() => {
    if (reduced) return
    const marks = [260, 900, 1400, 1950]
    const timers = marks.map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    return () => timers.forEach(clearTimeout)
  }, [reduced])

  if (!clear) return null

  const items = events.filter((e) => e.type === 'item')
  const achs = events.filter((e) => e.type === 'achievement')
  const bonus = events.filter((e) => e.type === 'xp')

  // Did this clear finish a whole zone? Worth marking — a gate opens.
  const zone = mission.zone
  const zoneMissions = game.catalogue.filter((m) => m.zone === zone)
  const zoneDone = zoneMissions.length > 0 && zoneMissions.every((m) => game.progress[m.id]?.bestTier)
  const zoneJustDone = zoneDone && clear.firstClear

  const rewards = [
    { key: 'base', label: 'Mission complete', value: `+${clear.xp.base} XP` },
    clear.xp.tierBonus > 0 && { key: 'tier', label: `${TIER_LABEL[outcome.tier]} bonus`, value: `+${clear.xp.tierBonus} XP` },
    clear.xp.streakBonus > 0 && { key: 'streak', label: `Streak ×${clear.streak}`, value: `+${clear.xp.streakBonus} XP` },
    ...bonus.map((b, i) => ({ key: 'b' + i, label: b.label, value: `+${b.amount} XP` })),
    ...items.map((it, i) => ({ key: 'i' + i, label: `${it.streak}-mission clean streak`, value: `${ITEMS[it.key].icon} ${ITEMS[it.key].name}` })),
    ...achs.map((a, i) => ({ key: 'a' + i, label: ACHIEVEMENTS[a.key].detail, value: `★ ${ACHIEVEMENTS[a.key].name}` }))
  ].filter(Boolean)

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Sector restored"
         onClick={() => !reduced && setStep(4)}>
      <div className={`modal result-modal step-${step}`} onClick={(e) => e.stopPropagation()}>

        {/* The relay coming back online. */}
        <div className="relay">
          <svg viewBox="0 0 240 90" aria-hidden="true">
            <line className="relay-wire" x1="16" y1="45" x2="224" y2="45" strokeWidth="2" />
            <line className="relay-surge" x1="16" y1="45" x2="224" y2="45" strokeWidth="2.5" />
            <circle className="relay-node from" cx="16" cy="45" r="7" />
            <circle className="relay-node to" cx="224" cy="45" r="9" />
            <circle className="relay-halo" cx="224" cy="45" r="9" fill="none" strokeWidth="2" />
          </svg>
          <div className="relay-status" aria-live="polite">
            {step === 0 ? 'RECONNECTING' : `SECTOR ${mission.level} ONLINE`}
          </div>
        </div>

        <h2 className="result-title">{mission.title}</h2>
        <p className="result-story">{mission.story.success}</p>

        {zoneJustDone && (
          <div className="zone-clear">
            <b>ZONE RESTORED</b>
            <span>Every relay in this zone answers. The gate ahead cycles open.</span>
          </div>
        )}

        <div className="tierline result-tiers">
          {['bronze', 'silver', 'gold'].map((t) => (
            <div key={t} className={`tierbox ${t} ${outcome.tier === t ? 'on' : ''}`}>
              <small>{t}</small>{TIER_LABEL[t]}
            </div>
          ))}
        </div>

        <div className="reward-list">
          {rewards.map((r, i) => (
            <div className="reward-row" key={r.key} style={{ transitionDelay: reduced ? '0ms' : `${i * 110}ms` }}>
              <span>{r.label}</span>
              <b>{r.value}</b>
            </div>
          ))}
        </div>

        {!clear.firstClear && (
          <p className="result-note">
            Replay — base XP is only awarded on a first clear, but the rating still improves.
          </p>
        )}

        <div className="modal-actions result-actions">
          <button className="btn btn-ghost" onClick={onStay}>Stay here</button>
          <button className="btn btn-primary" onClick={onNext}>
            {zoneJustDone ? 'Open the gate' : 'Return to map'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProfilePanel({ onClose }) {
  const game = useGame()
  const mastery = computeMastery(game.catalogue, game.progress)
  const { level } = playerLevelFor(game.xp)
  const inv = Object.entries(game.inventory)

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Profile">
      <div className="modal modal-wide">
        <div className="eyebrow">Code Runner</div>
        <h2>Player level {level}</h2>
        <p style={{ color: 'var(--fg-dim)', marginTop: 4 }}>
          {game.xp.toLocaleString()} XP · campaign {game.highestCleared}/{TOTAL_CAMPAIGN_LEVELS} ·
          best streak {game.bestStreak}
        </p>

        <div className="section-h">Skill mastery</div>
        <div className="mastery">
          {mastery.map((m) => (
            <div className="mastery-row" key={m.topic}>
              <span style={{ textTransform: 'capitalize' }}>{m.topic}</span>
              <div className="bar"><i style={{ width: `${m.percent}%` }} /></div>
              <span style={{ textAlign: 'right', color: 'var(--fg-dim)', fontVariantNumeric: 'tabular-nums' }}>{m.percent}%</span>
            </div>
          ))}
        </div>

        <div className="section-h">Inventory</div>
        {inv.length === 0
          ? <p style={{ color: 'var(--fg-faint)', fontSize: 13 }}>Empty. Clear 3 missions in a row without a failed submission to earn your first item.</p>
          : (
            <div className="grid-cards">
              {inv.map(([key, count]) => (
                <div className="card" key={key}>
                  <b>{ITEMS[key].icon} {ITEMS[key].name} ×{count}</b>
                  <small>{ITEMS[key].detail}</small>
                </div>
              ))}
            </div>
          )}

        <div className="section-h">Achievements</div>
        <div className="grid-cards">
          {Object.entries(ACHIEVEMENTS).map(([key, a]) => (
            <div className={`card ${game.achievements.includes(key) ? '' : 'dim'}`} key={key}>
              <b>{game.achievements.includes(key) ? '★' : '☆'} {a.name}</b>
              <small>{a.detail}</small>
            </div>
          ))}
        </div>

        {game.cloudEnabled && (
          <>
            <div className="section-h">Account</div>
            {game.session
              ? <p style={{ fontSize: 13.5 }}>
                  Signed in as <b>{game.session.user.email}</b>. Progress syncs automatically.
                  {game.syncError && <span style={{ color: 'var(--bad)' }}> Last sync failed: {game.syncError}</span>}
                </p>
              : <p style={{ fontSize: 13.5, color: 'var(--fg-dim)' }}>
                  Playing offline. Progress is stored in this browser only.
                </p>}
          </>
        )}

        <div className="section-h">Settings</div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
          <input type="checkbox" checked={game.settings.reducedMotion}
                 onChange={(e) => game.setSettings({ reducedMotion: e.target.checked })} />
          Reduce motion (disables map pulses and toast animation)
        </label>

        <div className="modal-actions">
          {game.cloudEnabled && game.session && (
            <button className="btn btn-ghost" onClick={() => game.signOut()}>Sign out</button>
          )}
          <button className="btn btn-ghost" onClick={() => {
            if (confirm('Erase all local progress? This cannot be undone.')) game.resetProgress()
          }}>Reset progress</button>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function Toasts({ items }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div className="toast" key={t.id} style={{ borderLeftColor: t.tone || 'var(--accent)' }}>
          <b>{t.title}</b>
          {t.body && <small>{t.body}</small>}
        </div>
      ))}
    </div>
  )
}
