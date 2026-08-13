// Deliberately naive. The verifier asserts this fails the performance gate.
export default (readings, k) => {
  if (k === 0) return 0
  let best = 0
  for (let i = 0; i < readings.length; i++) {
    const seen = new Set()
    let j = i
    while (j < readings.length) {
      seen.add(readings[j])
      if (seen.size > k) break
      j++
    }
    if (j - i > best) best = j - i
  }
  return best
}
