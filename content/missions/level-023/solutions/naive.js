// Deliberately naive. The verifier asserts this fails the performance gate.
export default (frequencies, target) => {
  for (let j = 1; j < frequencies.length; j++) {
    for (let i = 0; i < j; i++) {
      if (frequencies[i] + frequencies[j] === target) return [i, j]
    }
  }
  return []
}
