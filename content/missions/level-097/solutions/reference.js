// Reference solution. Correct and optimal. Iterative throughout.
export default (costs) => {
  const n = costs.length
  if (n === 0) return 0
  const size = 1 << n
  const best = new Array(size).fill(Infinity)
  best[0] = 0
  for (let mask = 0; mask < size; mask++) {
    if (best[mask] === Infinity) continue
    // Number of assigned tasks is the crew index now being assigned.
    let crew = 0
    for (let b = 0; b < n; b++) if (mask & (1 << b)) crew++
    if (crew === n) continue
    for (let task = 0; task < n; task++) {
      if (mask & (1 << task)) continue
      const next = mask | (1 << task)
      const candidate = best[mask] + costs[crew][task]
      if (candidate < best[next]) best[next] = candidate
    }
  }
  return best[size - 1]
}
