// Deliberately naive solution. The verifier asserts this FAILS the performance
// gate. If it passes, the gate is decorative and the Efficient rating is
// meaningless. Only needed for missions that define `perf`.
export default (readings) => {
  let mn = readings[0], mx = readings[0]
  for (let i = 0; i < readings.length; i++) {
    for (let j = 0; j < readings.length; j++) {
      if (readings[j] < mn) mn = readings[j]
      if (readings[j] > mx) mx = readings[j]
    }
  }
  return mx - mn
}
