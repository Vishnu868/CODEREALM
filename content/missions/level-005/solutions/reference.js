// Reference solution. Optimal and correct — it defines expected output AND the
// performance baseline. Never shown to the player.
export default (a) => {
  const m = new Map()
  for (const v of a) m.set(v, (m.get(v) || 0) + 1)
  let best = null, bc = -1
  for (const [v, c] of m) {
    if (c > bc || (c === bc && v < best)) { best = v; bc = c }
  }
  return best
}
