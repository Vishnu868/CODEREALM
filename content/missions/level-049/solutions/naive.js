// Deliberately naive. The verifier asserts this fails the performance gate.
export default (readings) => readings.map((v, i) => {
  for (let j = i + 1; j < readings.length; j++) if (readings[j] > v) return readings[j]
  return -1
})
