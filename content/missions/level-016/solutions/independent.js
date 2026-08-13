// Independent implementation, written without reference to reference.js.
export default (readings, k) => {
  if (k < 1 || k > readings.length) return -1
  // Prefix sums: window (i, i+k) is prefix[i + k] - prefix[i].
  const prefix = new Array(readings.length + 1).fill(0)
  for (let i = 0; i < readings.length; i++) prefix[i + 1] = prefix[i] + readings[i]
  let best = -Infinity
  for (let i = 0; i + k <= readings.length; i++) {
    const s = prefix[i + k] - prefix[i]
    if (s > best) best = s
  }
  return best
}
