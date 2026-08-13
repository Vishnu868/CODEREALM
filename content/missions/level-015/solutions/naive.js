// Deliberately naive. The verifier asserts this fails the performance gate.
export default (charges, target) => {
  for (let i = 0; i < charges.length; i++) {
    for (let j = i + 1; j < charges.length; j++) {
      if (charges[i] + charges[j] === target) return [i, j]
    }
  }
  return []
}
