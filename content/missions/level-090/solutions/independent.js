// Independent implementation, written without reference to reference.js.
export default (prices) => {
  // Explicit table over the three states.
  const n = prices.length
  if (n === 0) return 0
  const holding = new Array(n).fill(-Infinity)
  const sold = new Array(n).fill(-Infinity)
  const free = new Array(n).fill(0)
  holding[0] = -prices[0]
  for (let i = 1; i < n; i++) {
    holding[i] = Math.max(holding[i - 1], free[i - 1] - prices[i])
    sold[i] = holding[i - 1] + prices[i]
    free[i] = Math.max(free[i - 1], sold[i - 1])
  }
  return Math.max(0, free[n - 1], sold[n - 1])
}
