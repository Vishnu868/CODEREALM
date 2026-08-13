// Deliberately naive. The verifier asserts this fails the performance gate.
export default (repairs) => {
  // Scan every cycle backwards from the deadline looking for a free one.
  if (repairs.length === 0) return 0
  const sorted = [...repairs].sort((a, b) => b[1] - a[1])
  let latest = 0
  for (const r of sorted) if (r[0] > latest) latest = r[0]
  const taken = new Array(latest + 1).fill(false)
  let total = 0
  for (const [deadline, value] of sorted) {
    for (let c = deadline; c >= 1; c--) {
      if (!taken[c]) { taken[c] = true; total += value; break }
    }
  }
  return total
}
