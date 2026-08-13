import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../game/store'
import { TIER_RANK, playerLevelFor } from '../game/rules'

/**
 * The ending.
 *
 * Plays once when level 100 is cleared, and can be replayed from the map. The
 * sequence is staged rather than instant: sectors light in sequence, the Core
 * spins up, then the status report resolves. That pacing is the whole point —
 * a player who has spent weeks on this deserves more than a modal.
 *
 * Everything is SVG and CSS, so it costs no assets. With reduced motion enabled
 * the animation is skipped and the final state shows immediately.
 */

const STAGES = [
  { at: 0, label: 'REESTABLISHING LINK' },
  { at: 900, label: 'POWERING SECTORS 1–50' },
  { at: 2100, label: 'POWERING SECTORS 51–100' },
  { at: 3300, label: 'CORE INTEGRITY 100%' },
  { at: 4200, label: 'SYSTEM RESTORED' }
]

export default function CoreRestored({ onClose }) {
  const game = useGame()
  const reduced = game.settings.reducedMotion
  const [stage, setStage] = useState(reduced ? STAGES.length - 1 : 0)
  const [done, setDone] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    const timers = STAGES.map((s, i) => setTimeout(() => setStage(i), s.at))
    const finish = setTimeout(() => setDone(true), 4900)
    return () => { timers.forEach(clearTimeout); clearTimeout(finish) }
  }, [reduced])

  const stats = useMemo(() => {
    const entries = game.catalogue.map((m) => game.progress[m.id]).filter(Boolean)
    const cleared = entries.filter((e) => e.bestTier)
    const gold = cleared.filter((e) => e.bestTier === 'gold').length
    const silver = cleared.filter((e) => e.bestTier === 'silver').length
    const bronze = cleared.filter((e) => e.bestTier === 'bronze').length
    const attempts = entries.reduce((n, e) => n + (e.attempts || 0), 0)
    const languages = new Set()
    entries.forEach((e) => (e.languages || []).forEach((l) => languages.add(l)))
    const perfectRun = cleared.length > 0 && cleared.every((e) => TIER_RANK[e.bestTier] === 3)
    return { cleared: cleared.length, gold, silver, bronze, attempts, languages: languages.size, perfectRun }
  }, [game.catalogue, game.progress])

  const { level } = playerLevelFor(game.xp)

  return (
    <div className={`ending ${done ? 'ending-done' : ''}`} role="dialog" aria-modal="true" aria-label="The Core is restored">
      <div className="ending-sky" />

      <svg className="ending-core" viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <radialGradient id="coreGlow">
            <stop offset="0%" stopColor="#e8c26b" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#4dd6c1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4dd6c1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sector spokes: each ring lights as its stage arrives. */}
        {[0, 1, 2, 3].map((ring) => (
          <circle
            key={ring}
            className={`core-ring ${stage > ring ? 'lit' : ''}`}
            cx="200" cy="200" r={62 + ring * 34}
            fill="none" strokeWidth={ring === 3 ? 2.5 : 1.5}
          />
        ))}

        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2
          const inner = 66
          const outer = 168
          return (
            <line
              key={i}
              className={`core-spoke ${stage >= 1 && i < (stage / (STAGES.length - 1)) * 24 ? 'lit' : ''}`}
              x1={200 + Math.cos(a) * inner} y1={200 + Math.sin(a) * inner}
              x2={200 + Math.cos(a) * outer} y2={200 + Math.sin(a) * outer}
              strokeWidth="1.5"
            />
          )
        })}

        <circle cx="200" cy="200" r="150" fill="url(#coreGlow)" className={`core-glow ${stage >= 3 ? 'lit' : ''}`} />
        <circle cx="200" cy="200" r="46" className={`core-heart ${stage >= 3 ? 'lit' : ''}`} />
        <text x="200" y="207" textAnchor="middle" className="core-mark">100</text>
      </svg>

      <div className="ending-body">
        <div className="ending-status" aria-live="polite">
          {STAGES[Math.min(stage, STAGES.length - 1)].label}
        </div>

        <h1 className="ending-title">THE CORE IS ONLINE</h1>

        <p className="ending-lede">
          Every relay answers. Every gate opens. The system you walked into as a stranger now runs
          on logic you wrote yourself — one hundred sectors of it, from a single pulse down a dead
          relay to the restoration of the Core itself.
        </p>

        <div className="ending-rank">
          <small>CodeRealm status</small>
          <b>{stats.perfectRun ? 'MASTER · FLAWLESS' : 'MASTER'}</b>
        </div>

        <div className="ending-stats">
          <div><b>{stats.cleared}</b><small>Sectors restored</small></div>
          <div><b>{game.xp.toLocaleString()}</b><small>XP earned</small></div>
          <div><b>{level}</b><small>Player level</small></div>
          <div><b>{game.bestStreak}</b><small>Best clean streak</small></div>
          <div><b>{stats.attempts}</b><small>Submissions</small></div>
          <div><b>{stats.languages}</b><small>Languages used</small></div>
        </div>

        <div className="ending-tiers">
          <span className="et gold">◆◆◆ {stats.gold} Perfect</span>
          <span className="et silver">◆◆ {stats.silver} Efficient</span>
          <span className="et bronze">◆ {stats.bronze} Solved</span>
        </div>

        <p className="ending-note">
          The campaign ends here, but the map does not close. Any sector can be replayed to improve
          its rating, or solved again in another language.
        </p>

        <div className="ending-actions">
          <button className="btn btn-primary btn-lg" onClick={onClose}>Return to the map</button>
        </div>
      </div>
    </div>
  )
}
