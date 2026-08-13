// Independent implementation, written without reference to reference.js.
export default (cells) => {
  // Table form: best[i] is the best total considering the first i cells.
  const n = cells.length
  if (n === 0) return 0
  const best = new Array(n + 1).fill(0)
  best[1] = cells[0]
  for (let i = 2; i <= n; i++) {
    best[i] = Math.max(best[i - 1], best[i - 2] + cells[i - 1])
  }
  return best[n]
}
