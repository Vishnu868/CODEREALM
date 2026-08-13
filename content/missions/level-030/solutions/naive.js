// Deliberately naive. The verifier asserts this fails the performance gate.
export default (readings) => {
  let best = -Infinity
  for (let i = 0; i < readings.length; i++) {
    let s = 0
    for (let j = i; j < readings.length; j++) {
      s += readings[j]
      if (s > best) best = s
    }
  }
  return best
}
