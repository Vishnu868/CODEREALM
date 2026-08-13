// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, pulses) => {
  const cells = new Array(n).fill(0)
  for (const [l, r, v] of pulses) {
    for (let i = l; i <= r; i++) cells[i] += v
  }
  return cells
}
