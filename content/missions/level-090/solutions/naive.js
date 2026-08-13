// Deliberately naive. The verifier asserts this fails the performance gate.
export default (prices) => {
  // For each sale cycle, rescan every earlier buy cycle.
  const n = prices.length
  if (n === 0) return 0
  const best = new Array(n + 1).fill(0)
  for (let end = 1; end <= n; end++) {
    best[end] = best[end - 1]
    for (let buy = 0; buy < end; buy++) {
      const sell = end - 1
      const before = buy >= 2 ? best[buy - 1] : 0
      const profit = before + prices[sell] - prices[buy]
      if (profit > best[end]) best[end] = profit
    }
  }
  return best[n]
}
