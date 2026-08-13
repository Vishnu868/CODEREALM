// Deliberately naive. The verifier asserts this fails the performance gate.
export default (readings) => {
  // Best ascent ending at each position, comparing against every earlier one.
  const n = readings.length
  const best = new Array(n).fill(1)
  let answer = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (readings[j] < readings[i] && best[j] + 1 > best[i]) best[i] = best[j] + 1
    }
    if (best[i] > answer) answer = best[i]
  }
  return answer
}
