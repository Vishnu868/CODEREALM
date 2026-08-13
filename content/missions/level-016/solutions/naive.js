// Deliberately naive. The verifier asserts this fails the performance gate.
export default (readings, k) => {
  if (k < 1 || k > readings.length) return -1
  let best = -Infinity
  for (let i = 0; i + k <= readings.length; i++) {
    let s = 0
    for (let j = i; j < i + k; j++) s += readings[j]
    if (s > best) best = s
  }
  return best
}
