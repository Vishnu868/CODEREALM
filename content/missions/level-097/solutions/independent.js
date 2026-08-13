// Independent implementation, written without reference to reference.js.
export default (costs) => {
  // Recursive search over free tasks, memoised on the mask.
  const n = costs.length
  if (n === 0) return 0
  const memo = new Map()
  const solve = (crew, mask) => {
    if (crew === n) return 0
    if (memo.has(mask)) return memo.get(mask)
    let best = Infinity
    for (let task = 0; task < n; task++) {
      if (mask & (1 << task)) continue
      const candidate = costs[crew][task] + solve(crew + 1, mask | (1 << task))
      if (candidate < best) best = candidate
    }
    memo.set(mask, best)
    return best
  }
  return solve(0, 0)
}
