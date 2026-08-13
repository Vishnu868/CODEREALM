// Independent implementation, written without reference to reference.js.
export default (n) => {
  // Fill a table of every rung, then read the last entry.
  const ways = new Array(n + 1).fill(0)
  ways[0] = 1
  for (let i = 1; i <= n; i++) {
    ways[i] = ways[i - 1] + (i >= 2 ? ways[i - 2] : 0)
  }
  return ways[n]
}
