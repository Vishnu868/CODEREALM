// Deliberately naive. The verifier asserts this fails the performance gate.
export default (readings) => {
  let best = 0
  for (let i = 0; i < readings.length; i++) {
    let len = 1
    for (let j = i + 1; j < readings.length && readings[j] > readings[j - 1]; j++) len++
    if (len > best) best = len
  }
  return best
}
