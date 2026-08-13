import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../game/store'
import { TIER_ICON } from '../game/rules'
import ZoneScenery from './ZoneScenery'
import Runner from './Runner'

/**
 * The campaign map.
 *
 * Plain SVG, no game engine. Each node is a real focusable <g role="button">,
 * so the map is keyboard navigable and readable by a screen reader — a canvas
 * would not be.
 *
 * ── Layout ────────────────────────────────────────────────────────────────
 * The map fills the window width exactly and scrolls vertically only. Columns
 * are computed from the measured width rather than fixed, so a wide monitor
 * gets more nodes per row and a narrow one fewer, and the spacing always
 * divides the available width evenly. There is no zoom control and no
 * horizontal scrollbar: nothing to adjust, nothing to get wrong.
 *
 * An earlier version scaled the whole campaign to fit the viewport height,
 * which squeezed 100 nodes into an unreadable sliver. Node size is now constant
 * and the map is simply as tall as it needs to be.
 */

const MIN_COL = 230        // narrowest a column may get before dropping one
const MAX_PER_ROW = 6
const MIN_PER_ROW = 2
const ROW_GAP = 200
const TOP_PAD = 96
const BOTTOM_PAD = 80
const NODE_R = 30

const ZONE_LABEL = {
  valley: 'Beginner Valley',
  district: 'Programming District',
  forest: 'Data Structure Forest',
  network: 'Network Zone',
  core: 'The Core'
}
const ZONE_ACCENT = {
  valley: '#4dd6c1',
  district: '#6aa9ff',
  forest: '#8fd96a',
  network: '#c88fff',
  core: '#ffb46b'
}
const ZONE_BLURB = {
  valley: 'The Core has gone dark. Repair each relay in sequence to push power down the valley.',
  district: 'The district logs everything. Arrays and strings are how you read it.',
  forest: 'Hashing, prefix sums and trees. The forest remembers what it has seen.',
  network: 'Searching, recursion, stacks and graphs. Everything here is connected.',
  core: 'Greedy choices, dynamic programming, and the Core itself.'
}

/** Deterministic dust motes, so the field is identical on every render. */
function makeDust(count, width, height) {
  let seed = 20260813
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  return Array.from({ length: count }, () => ({
    x: rand() * width,
    y: rand() * height,
    r: 0.7 + rand() * 1.6,
    delay: -rand() * 14,
    dur: 9 + rand() * 12,
    o: 0.15 + rand() * 0.4
  }))
}

export default function MapView({ onOpen, onShowIntro, justCleared, onSurgeDone }) {
  const { isUnlocked, progress, unlockedThrough, settings, catalogue } = useGame()
  const stage = useRef(null)
  const [width, setWidth] = useState(1200)

  // Track the available width so the layout can divide it evenly.
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth || 1200)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const perRow = Math.max(MIN_PER_ROW, Math.min(MAX_PER_ROW, Math.floor(width / MIN_COL)))
  const colGap = width / perRow

  const points = useMemo(() => {
    return catalogue.map((m, i) => {
      const row = Math.floor(i / perRow)
      const inRow = i % perRow
      // Alternate direction each row so the route reads as one continuous path.
      const col = row % 2 === 0 ? inRow : perRow - 1 - inRow
      return {
        x: colGap * (col + 0.5),
        y: TOP_PAD + row * ROW_GAP + (col % 2 === 0 ? 0 : -22),
        mission: m
      }
    })
  }, [catalogue, perRow, colGap])

  const rows = Math.max(1, Math.ceil(catalogue.length / perRow))
  const height = TOP_PAD + rows * ROW_GAP + BOTTOM_PAD

  const dust = useMemo(
    () => (settings.reducedMotion ? [] : makeDust(70, width, height)),
    [width, height, settings.reducedMotion]
  )

  // Zone bands, so the campaign reads as five places rather than one long list.
  const bands = useMemo(() => {
    const out = []
    points.forEach((p) => {
      const zone = p.mission.zone
      const last = out[out.length - 1]
      if (!last || last.zone !== zone) {
        out.push({ zone, top: p.y - NODE_R - 58, bottom: p.y + NODE_R + 58 })
      } else {
        last.bottom = Math.max(last.bottom, p.y + NODE_R + 58)
        last.top = Math.min(last.top, p.y - NODE_R - 58)
      }
    })
    return out
  }, [points])

  const current = points.find((p) => p.mission.level === unlockedThrough) ?? points[points.length - 1]

  const centreOn = (target, smooth) => {
    const el = stage.current
    if (!el || !target) return
    el.scrollTo({
      top: Math.max(0, target.y - el.clientHeight / 2),
      behavior: smooth && !settings.reducedMotion ? 'smooth' : 'auto'
    })
  }

  // Open the map on the player's current level rather than at level 1.
  useEffect(() => {
    centreOn(current, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.mission.id, perRow])

  // The surge plays once when returning from a cleared mission, then clears
  // itself so it never repeats on a later render.
  useEffect(() => {
    if (!justCleared || !onSurgeDone) return
    const t = setTimeout(onSurgeDone, settings.reducedMotion ? 0 : 1800)
    return () => clearTimeout(t)
  }, [justCleared, onSurgeDone, settings.reducedMotion])

  // The Runner stands beside the current sector and slides across when it
  // moves, so clearing a level visibly advances them down the route.
  const runnerAt = current
    ? { x: current.x - 52, y: current.y + 30, accent: ZONE_ACCENT[current.mission.zone] ?? '#4dd6c1' }
    : null
  const runnerState = justCleared ? 'cheer' : 'idle'

  const line = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  const clearedCount = points.filter((p) => progress[p.mission.id]?.bestTier).length

  return (
    <div className="map-wrap">
      <div className="map-stage" ref={stage}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label={`Campaign map, ${catalogue.length} levels`}
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d131c" />
              <stop offset="100%" stopColor="#0a0d12" />
            </linearGradient>
            <filter id="soften" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width={width} height={height} fill="url(#sky)" />

          {/* Dust drifting through the dark. Purely ambient. */}
          {dust.map((d, i) => (
            <circle key={i} className="dust" cx={d.x} cy={d.y} r={d.r}
              opacity={d.o}
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
          ))}

          {bands.map((b, i) => (
            <g key={i}>
              <rect x="0" y={b.top} width={width} height={b.bottom - b.top}
                fill={ZONE_ACCENT[b.zone] ?? '#4dd6c1'} opacity="0.04" />
              {/* Scenery sits under the route and nodes, never over them. */}
              <ZoneScenery
                id={i}
                zone={b.zone}
                top={b.top}
                bottom={b.bottom}
                width={width}
                accent={ZONE_ACCENT[b.zone] ?? '#4dd6c1'}
              />
              <line x1="0" y1={b.top} x2={width} y2={b.top}
                stroke={ZONE_ACCENT[b.zone] ?? '#4dd6c1'} opacity="0.2" />
              <text x="24" y={b.top + 26} fontSize="12" letterSpacing="3"
                fill={ZONE_ACCENT[b.zone] ?? '#4dd6c1'} opacity="0.85">
                {(ZONE_LABEL[b.zone] ?? b.zone).toUpperCase()}
              </text>
            </g>
          ))}

          {/* The full route, then the portion already powered. */}
          <path id="route" d={line} fill="none" stroke="#232c3b" strokeWidth="4" strokeLinecap="round" />

          {/* A faint current searching along the dead line. */}
          {!settings.reducedMotion && (
            <path className="route-idle" d={line} fill="none" stroke="#2f3d52"
              strokeWidth="4" strokeLinecap="round" strokeDasharray="12 220" />
          )}

          <path className="route-live" d={line} fill="none" stroke="#4dd6c1" strokeWidth="4"
            strokeLinecap="round" filter="url(#soften)"
            pathLength={Math.max(points.length - 1, 1)}
            strokeDasharray={`${Math.max(0, clearedCount)} ${points.length}`}
            opacity="0.8" />

          {/* Power travelling down the restored stretch. */}
          {!settings.reducedMotion && clearedCount > 0 && [0, 1, 2].map((i) => (
            <circle key={i} r="4" fill="#7df0dd" opacity="0.9">
              <animateMotion
                dur={`${Math.max(4, clearedCount * 1.1)}s`}
                begin={`${i * 1.6}s`}
                repeatCount="indefinite"
                keyPoints={`0;${clearedCount / Math.max(points.length - 1, 1)}`}
                keyTimes="0;1"
                calcMode="linear"
              >
                <mpath href="#route" />
              </animateMotion>
            </circle>
          ))}

          {points.map(({ x, y, mission }) => {
            const unlocked = isUnlocked(mission.level)
            const tier = progress[mission.id]?.bestTier
            const isCurrent = unlocked && !tier
            const surging = justCleared === mission.id && !settings.reducedMotion
            const accent = mission.milestone === 'final'
              ? '#e8c26b'
              : (ZONE_ACCENT[mission.zone] ?? '#4dd6c1')
            const fill = tier ? accent : unlocked ? '#151b26' : '#101620'
            const stroke = tier ? accent : unlocked ? '#6aa9ff' : '#222b3a'
            const r = mission.milestone ? NODE_R + 5 : NODE_R

            return (
              <g
                key={mission.id}
                className={`node ${unlocked ? '' : 'node-locked'} ${surging ? 'node-surge' : ''}`}
                role="button"
                tabIndex={unlocked ? 0 : -1}
                aria-disabled={!unlocked}
                aria-label={`Level ${mission.level}, ${mission.title}. ${tier ? `Completed, rating ${tier}.` : unlocked ? 'Available.' : 'Locked.'
                  }`}
                onClick={() => unlocked && onOpen(mission)}
                onKeyDown={(e) => {
                  if (unlocked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(mission) }
                }}
              >
                {isCurrent && !settings.reducedMotion && (
                  <>
                    <circle className="node-pulse" cx={x} cy={y} r={r + 6} fill="none"
                      stroke="#6aa9ff" strokeWidth="2" />
                    <circle className="node-scan" cx={x} cy={y} r={r + 13} fill="none"
                      stroke="#6aa9ff" strokeWidth="1.5" strokeDasharray="3 9"
                      style={{ transformOrigin: `${x}px ${y}px` }} />
                  </>
                )}
                {tier && !settings.reducedMotion && (
                  <circle className="node-live" cx={x} cy={y} r={r + 4} fill="none"
                    stroke={accent} strokeWidth="1.5"
                    style={{ animationDelay: `${(mission.level % 7) * 0.4}s` }} />
                )}
                {mission.milestone && (
                  <circle cx={x} cy={y} r={r + 10} fill="none" stroke={tier ? accent : '#2b3547'}
                    strokeWidth="1.5" strokeDasharray="4 5" />
                )}
                {surging && (
                  <circle className="surge-ring" cx={x} cy={y} r={r} fill="none"
                    stroke={accent} strokeWidth="2.5" />
                )}
                <circle className="node-ring" cx={x} cy={y} r={r} fill={fill} stroke={stroke}
                  strokeWidth={mission.milestone ? 3 : 2.5} />
                <text x={x} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="600"
                  className={!unlocked && !settings.reducedMotion ? 'locked-flicker' : undefined}
                  style={!unlocked ? { animationDelay: `${(mission.level % 11) * 0.7}s` } : undefined}
                  fill={tier ? '#06231f' : unlocked ? '#e6ecf5' : '#4a5568'}
                  fontFamily="var(--mono)" pointerEvents="none">
                  {unlocked ? mission.level : '\u25cf'}
                </text>
                <text x={x} y={y + r + 26} textAnchor="middle" className="node-title"
                  fontSize="14" pointerEvents="none">{mission.title}</text>
                <text x={x} y={y + r + 44} textAnchor="middle" className="node-label"
                  pointerEvents="none">
                  {tier ? TIER_ICON[tier] : unlocked ? 'AVAILABLE' : 'LOCKED'}
                </text>
                {mission.milestone && (
                  <text x={x} y={y - r - 18} textAnchor="middle" className="node-label"
                    fill={tier ? accent : '#5d6879'} letterSpacing="2" pointerEvents="none">
                    {mission.milestone === 'final' ? 'THE CORE' : 'MILESTONE'}
                  </text>
                )}
              </g>
            )
          })}
          {runnerAt && (
            <Runner x={runnerAt.x} y={runnerAt.y} accent={runnerAt.accent} state={runnerState} />
          )}
        </svg>
      </div>

      {/* One control: jump back to where the player actually is. */}
      <button className="btn map-jump" onClick={() => centreOn(current, true)}
        title={`Scroll to level ${current?.mission.level ?? 1}`}>
        ⌖ Go to level {current?.mission.level ?? 1}
      </button>

      <div className="map-legend">
        <h4>{ZONE_LABEL[current?.mission.zone] ?? 'Campaign'}</h4>
        <p>{ZONE_BLURB[current?.mission.zone] ?? 'Clear each level to power the next.'}</p>
        <div className="legend-row">
          <span><i className="dot" style={{ background: '#4dd6c1' }} /> Cleared</span>
          <span><i className="dot" style={{ background: '#6aa9ff' }} /> Available</span>
          <span><i className="dot" style={{ background: '#232c3b' }} /> Locked</span>
        </div>
        {onShowIntro && (
          <button className="btn btn-ghost legend-link" onClick={onShowIntro}>
            What is this? →
          </button>
        )}
      </div>
    </div>
  )
}