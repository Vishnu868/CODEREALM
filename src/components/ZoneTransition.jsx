import { useEffect, useState } from 'react'
import { useGame } from '../game/store'

/**
 * The gate between zones.
 *
 * Completing a zone is the largest thing that happens outside sectors 50 and
 * 100, and until now it was a line of text in a modal. This is the beat that
 * makes the map's five zones feel like five places: the gate you have been
 * looking at since you entered the zone finally cycles open, and the next
 * region's colour bleeds in behind it.
 *
 * About four seconds, skippable by clicking. Pure SVG and CSS — no assets, and
 * reduced motion cuts straight to the end.
 */

const ZONE = {
  valley: {
    name: 'Beginner Valley',
    accent: '#4dd6c1',
    closing: 'Every relay in the valley answers. The gate to the Programming District cycles open.'
  },
  district: {
    name: 'Programming District',
    accent: '#6aa9ff',
    closing: 'The district reports clean. Its records are yours, and the forest lies beyond.'
  },
  forest: {
    name: 'Data Structure Forest',
    accent: '#8fd96a',
    closing: 'The canopy stabilises. Every branch is walkable, and the network hums ahead.'
  },
  network: {
    name: 'Network Zone',
    accent: '#c88fff',
    closing: 'The network is whole. Every route resolves — and the Core is finally in reach.'
  },
  core: {
    name: 'The Core',
    accent: '#ffb46b',
    closing: 'The Core stands open.'
  }
}

const NEXT = { valley: 'district', district: 'forest', forest: 'network', network: 'core' }

const STAGES = [
  { at: 0, label: 'SECTOR SWEEP COMPLETE' },
  { at: 800, label: 'RELEASING GATE LOCKS' },
  { at: 1700, label: 'GATE OPEN' }
]

export default function ZoneTransition({ zone, onDone }) {
  const { settings } = useGame()
  const reduced = settings.reducedMotion
  const [stage, setStage] = useState(reduced ? 2 : 0)
  const [open, setOpen] = useState(reduced)

  const here = ZONE[zone] ?? ZONE.valley
  const next = ZONE[NEXT[zone]] ?? null

  useEffect(() => {
    if (reduced) return
    const timers = STAGES.map((s, i) => setTimeout(() => setStage(i), s.at))
    const doors = setTimeout(() => setOpen(true), 1700)
    return () => { timers.forEach(clearTimeout); clearTimeout(doors) }
  }, [reduced])

  return (
    <div className={`gate ${open ? 'gate-open' : ''}`} role="dialog" aria-modal="true"
         aria-label={`${here.name} restored`} onClick={onDone}>

      {/* The zone beyond, revealed as the doors part. */}
      <div className="gate-beyond" style={{ '--beyond': next ? next.accent : here.accent }} />

      <div className="gate-doors" style={{ '--accent': here.accent }}>
        <div className="gate-door gate-left">
          <svg viewBox="0 0 200 600" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="0" width="200" height="600" fill="#0b1017" />
            <line x1="199" y1="0" x2="199" y2="600" stroke={here.accent} strokeWidth="2" opacity="0.5" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={150} y={20 + i * 48} width="44" height="16" fill={here.accent} opacity="0.13" />
            ))}
          </svg>
        </div>
        <div className="gate-door gate-right">
          <svg viewBox="0 0 200 600" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="0" width="200" height="600" fill="#0b1017" />
            <line x1="1" y1="0" x2="1" y2="600" stroke={here.accent} strokeWidth="2" opacity="0.5" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={6} y={20 + i * 48} width="44" height="16" fill={here.accent} opacity="0.13" />
            ))}
          </svg>
        </div>
      </div>

      <div className="gate-body">
        <div className="gate-status" aria-live="polite" style={{ color: here.accent }}>
          {STAGES[Math.min(stage, STAGES.length - 1)].label}
        </div>
        <h2 className="gate-title">{here.name.toUpperCase()} RESTORED</h2>
        <p className="gate-line">{here.closing}</p>
        {next && (
          <div className="gate-next" style={{ '--accent': next.accent }}>
            <span>Ahead</span>
            <b>{next.name}</b>
          </div>
        )}
        <button className="btn btn-primary btn-lg gate-go" onClick={onDone}>
          {next ? `Enter ${next.name}` : 'Continue'}
        </button>
      </div>
    </div>
  )
}
