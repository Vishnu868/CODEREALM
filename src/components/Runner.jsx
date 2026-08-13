/**
 * The Code Runner.
 *
 * A character standing at the player's current sector, with a drone companion.
 * Drawn as SVG rather than illustrated: vector art costs nothing to download,
 * scales with the map, recolours per zone, and animates through CSS instead of
 * sprite sheets.
 *
 * Stylised rather than cartoonish — the palette and the restraint of the rest
 * of the interface are doing real work, and a character that fights them would
 * cheapen the whole screen. Silhouette and motion carry the personality; there
 * is no face.
 *
 * States:
 *   idle       breathing, drone bobbing alongside
 *   working    the player is in a mission; drone scans
 *   cheer      a sector was just cleared
 */
export default function Runner({ x, y, accent = '#4dd6c1', state = 'idle', flip = false }) {
  return (
    <g
      className={`runner runner-${state}`}
      transform={`translate(${x}, ${y}) scale(${flip ? -1 : 1}, 1)`}
      pointerEvents="none"
      aria-hidden="true"
    >
      {/* The pool of light they stand in. */}
      <ellipse className="runner-shadow" cx="0" cy="4" rx="17" ry="4.5" fill={accent} opacity="0.16" />

      <g className="runner-body">
        {/* Legs */}
        <path className="leg leg-back" d="M -3 -18 L -6 -4" stroke={accent} strokeWidth="3.4"
              strokeLinecap="round" opacity="0.55" />
        <path className="leg leg-front" d="M 3 -18 L 5 -4" stroke={accent} strokeWidth="3.4"
              strokeLinecap="round" opacity="0.8" />

        {/* Torso: a courier's jacket, cut as one shape. */}
        <path d="M -7 -40 Q 0 -43 7 -40 L 8 -18 Q 0 -16 -8 -18 Z"
              fill="#111a24" stroke={accent} strokeWidth="1.6" strokeLinejoin="round" />
        {/* The charge they carry — the thing being delivered to each relay. */}
        <circle className="runner-core" cx="0" cy="-30" r="3.2" fill={accent} />

        {/* Arms */}
        <path className="arm arm-back" d="M -7 -37 L -12 -25" stroke={accent} strokeWidth="2.8"
              strokeLinecap="round" opacity="0.5" />
        <path className="arm arm-front" d="M 7 -37 L 12 -26" stroke={accent} strokeWidth="2.8"
              strokeLinecap="round" opacity="0.75" />

        {/* Head and visor. No face — the silhouette does the work. */}
        <circle cx="0" cy="-48" r="6.4" fill="#111a24" stroke={accent} strokeWidth="1.6" />
        <path d="M -4 -49 Q 0 -51.5 4 -49" stroke={accent} strokeWidth="1.8" fill="none"
              strokeLinecap="round" opacity="0.9" />
      </g>

      {/* Drone companion. */}
      <g className="drone">
        <circle cx="20" cy="-52" r="5" fill="#111a24" stroke={accent} strokeWidth="1.5" />
        <circle className="drone-eye" cx="20" cy="-52" r="1.9" fill={accent} />
        <line x1="15.5" y1="-55" x2="12" y2="-57" stroke={accent} strokeWidth="1.3"
              strokeLinecap="round" opacity="0.6" />
        <line x1="24.5" y1="-55" x2="28" y2="-57" stroke={accent} strokeWidth="1.3"
              strokeLinecap="round" opacity="0.6" />
        {/* The link between runner and drone. */}
        <line className="drone-link" x1="8" y1="-46" x2="16" y2="-51" stroke={accent}
              strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      </g>

      {/* Celebration sparks, only rendered by the cheer state via CSS. */}
      <g className="runner-sparks">
        {[[-14, -58], [14, -62], [0, -66], [-20, -48], [22, -44]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r="2" fill={accent}
                  style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </g>
    </g>
  )
}
