/**
 * Zone scenery.
 *
 * Each zone gets a landscape drawn behind its nodes: hills in the valley, a
 * skyline in the district, a canopy in the forest, masts and arcs in the network
 * zone, and machinery at the Core.
 *
 * Everything is generated vector geometry rather than image files. A hundred
 * levels of artwork as PNGs would be megabytes; this is a few kilobytes of
 * JavaScript, scales to any width, and recolours itself per zone from a single
 * accent. It also means adding a sixth zone costs one function, not an
 * illustrator.
 *
 * Kept deliberately dim (opacity 0.05–0.3) — it is scenery behind the route, and
 * mission titles have to stay readable on top of it.
 */

/** Deterministic PRNG, so a zone's landscape is identical on every render. */
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export default function ZoneScenery({ zone, top, bottom, width, accent, id }) {
  const h = bottom - top
  if (h <= 0 || width <= 0) return null

  const draw = {
    valley: Valley,
    district: District,
    forest: Forest,
    network: Network,
    core: Core
  }[zone]
  if (!draw) return null

  return (
    <g clipPath={`url(#clip-${id})`} pointerEvents="none">
      <defs>
        <clipPath id={`clip-${id}`}>
          <rect x="0" y={top} width={width} height={h} />
        </clipPath>
      </defs>
      {draw({ top, bottom, width, h, accent, seed: 1000 + id * 977 })}
    </g>
  )
}

/* ── Beginner Valley: rolling hills and relay masts ────────────────────── */
function Valley({ top, bottom, width, h, accent, seed }) {
  const r = rng(seed)
  const ridge = (baseY, amp, step) => {
    let d = `M -20 ${bottom}`
    d += ` L -20 ${baseY}`
    for (let x = -20; x <= width + 20; x += step) {
      d += ` L ${x} ${baseY - Math.sin(x / step) * amp - r() * amp * 0.5}`
    }
    return d + ` L ${width + 20} ${bottom} Z`
  }
  const masts = Array.from({ length: 5 }, (_, i) => ({
    x: 60 + ((width - 120) / 4) * i + (r() - 0.5) * 40,
    hgt: 40 + r() * 46
  }))

  return (
    <>
      <path d={ridge(bottom - h * 0.34, h * 0.1, 170)} fill={accent} opacity="0.05" />
      <path d={ridge(bottom - h * 0.2, h * 0.07, 120)} fill={accent} opacity="0.07" />
      {masts.map((m, i) => {
        const baseY = bottom - h * 0.16
        return (
          <g key={i} opacity="0.22">
            <line x1={m.x} y1={baseY} x2={m.x} y2={baseY - m.hgt} stroke={accent} strokeWidth="1.2" />
            <line x1={m.x - 9} y1={baseY - m.hgt + 12} x2={m.x + 9} y2={baseY - m.hgt + 12}
                  stroke={accent} strokeWidth="1.2" />
            <circle cx={m.x} cy={baseY - m.hgt} r="2.4" fill={accent} />
          </g>
        )
      })}
    </>
  )
}

/* ── Programming District: a skyline of lit windows ────────────────────── */
function District({ bottom, width, h, accent, seed }) {
  const r = rng(seed)
  const towers = []
  let x = -30
  while (x < width + 30) {
    const w = 46 + r() * 62
    const tall = h * (0.16 + r() * 0.3)
    towers.push({ x, w, tall })
    x += w + 12 + r() * 26
  }
  return (
    <>
      {towers.map((t, i) => {
        const topY = bottom - h * 0.12 - t.tall
        const cols = Math.max(1, Math.floor(t.w / 18))
        const rows = Math.max(1, Math.floor(t.tall / 20))
        const win = []
        for (let c = 0; c < cols; c++) {
          for (let q = 0; q < rows; q++) {
            if (r() < 0.42) {
              win.push(
                <rect key={`${c}-${q}`} x={t.x + 9 + c * 18} y={topY + 12 + q * 20}
                      width="5" height="7" fill={accent} opacity={0.25 + r() * 0.45} />
              )
            }
          }
        }
        return (
          <g key={i}>
            <rect x={t.x} y={topY} width={t.w} height={t.tall + h * 0.12}
                  fill={accent} opacity="0.055" />
            <rect x={t.x} y={topY} width={t.w} height="1.2" fill={accent} opacity="0.22" />
            {win}
          </g>
        )
      })}
    </>
  )
}

/* ── Data Structure Forest: a canopy of branching trees ────────────────── */
function Forest({ bottom, width, h, accent, seed }) {
  const r = rng(seed)
  const trees = Array.from({ length: 7 }, (_, i) => ({
    x: 40 + ((width - 80) / 6) * i + (r() - 0.5) * 46,
    hgt: h * (0.24 + r() * 0.26),
    tilt: (r() - 0.5) * 0.4
  }))

  // Trees are drawn as recursive binary branches — the structure the zone teaches.
  const branch = (x, y, len, angle, depth, out) => {
    if (depth === 0 || len < 5) return
    const x2 = x + Math.sin(angle) * len
    const y2 = y - Math.cos(angle) * len
    out.push(
      <line key={`${x}-${y}-${depth}-${angle.toFixed(2)}`}
            x1={x} y1={y} x2={x2} y2={y2}
            stroke={accent} strokeWidth={Math.max(0.5, depth * 0.5)} opacity="0.2" />
    )
    branch(x2, y2, len * 0.68, angle - 0.42, depth - 1, out)
    branch(x2, y2, len * 0.68, angle + 0.42, depth - 1, out)
  }

  return (
    <>
      <rect x="0" y={bottom - h * 0.1} width={width} height={h * 0.1} fill={accent} opacity="0.05" />
      {trees.map((t, i) => {
        const out = []
        branch(t.x, bottom - h * 0.1, t.hgt * 0.42, t.tilt, 5, out)
        return <g key={i}>{out}</g>
      })}
    </>
  )
}

/* ── Network Zone: masts joined by signal arcs ─────────────────────────── */
function Network({ top, bottom, width, h, accent, seed }) {
  const r = rng(seed)
  const nodes = Array.from({ length: 9 }, (_, i) => ({
    x: 30 + ((width - 60) / 8) * i,
    y: top + h * (0.2 + r() * 0.6)
  }))
  const arcs = []
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]
    const b = nodes[i + 1]
    const midX = (a.x + b.x) / 2
    const midY = Math.min(a.y, b.y) - 30 - r() * 40
    arcs.push(
      <path key={i} d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
            fill="none" stroke={accent} strokeWidth="1" opacity="0.16" />
    )
    if (i % 3 === 0 && i + 2 < nodes.length) {
      const c = nodes[i + 2]
      arcs.push(
        <path key={`l${i}`} d={`M ${a.x} ${a.y} Q ${(a.x + c.x) / 2} ${a.y + 70} ${c.x} ${c.y}`}
              fill="none" stroke={accent} strokeWidth="0.8" opacity="0.1" />
      )
    }
  }
  return (
    <>
      <rect x="0" y={bottom - h * 0.08} width={width} height={h * 0.08} fill={accent} opacity="0.05" />
      {arcs}
      {nodes.map((n, i) => (
        <g key={i} opacity="0.28">
          <circle cx={n.x} cy={n.y} r="2.6" fill={accent} />
          <line x1={n.x} y1={n.y} x2={n.x} y2={bottom - h * 0.08} stroke={accent}
                strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
    </>
  )
}

/* ── The Core: concentric machinery and conduits ───────────────────────── */
function Core({ top, bottom, width, h, accent, seed }) {
  const r = rng(seed)
  const cx = width / 2
  const rings = Array.from({ length: 6 }, (_, i) => 90 + i * 78)
  const spokes = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2)
  const cy = top + h * 0.5

  return (
    <>
      {rings.map((rad, i) => (
        <circle key={i} cx={cx} cy={cy} r={rad} fill="none" stroke={accent}
                strokeWidth={i % 2 ? 0.8 : 1.4} opacity={0.13 - i * 0.012}
                strokeDasharray={i % 3 === 0 ? '10 18' : undefined} />
      ))}
      {spokes.map((a, i) => (
        <line key={i}
              x1={cx + Math.cos(a) * 90} y1={cy + Math.sin(a) * 90}
              x2={cx + Math.cos(a) * (300 + r() * 180)} y2={cy + Math.sin(a) * (300 + r() * 180)}
              stroke={accent} strokeWidth="0.7" opacity="0.09" />
      ))}
      {/* Conduits running the height of the zone. */}
      {[0.12, 0.3, 0.7, 0.88].map((f, i) => (
        <g key={i} opacity="0.12">
          <line x1={width * f} y1={top} x2={width * f} y2={bottom} stroke={accent} strokeWidth="2" />
          {Array.from({ length: 7 }, (_, q) => (
            <rect key={q} x={width * f - 5} y={top + (h / 7) * q + 18} width="10" height="4"
                  fill={accent} />
          ))}
        </g>
      ))}
    </>
  )
}
