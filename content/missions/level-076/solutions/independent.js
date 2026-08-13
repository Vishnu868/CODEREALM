// Independent implementation, written without reference to reference.js.
export default (relays, k) => {
  // Enumerate binary patterns and keep those with exactly k bits set. Patterns
  // read low bit first give the same lexicographic order by position.
  const n = relays.length
  if (k < 0 || k > n) return []
  const out = []
  for (let mask = 0; mask < (1 << n); mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) chosen.push(i)
    if (chosen.length !== k) continue
    out.push(chosen)
  }
  out.sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
    return 0
  })
  return out.map((positions) => positions.map((i) => relays[i]))
}
