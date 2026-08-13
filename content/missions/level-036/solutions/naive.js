// Deliberately naive. The verifier asserts this fails the performance gate.
export default (a, b) => {
  // Insert each value into its place one at a time.
  const out = []
  for (const v of [...a, ...b]) {
    let pos = 0
    while (pos < out.length && out[pos] <= v) pos++
    out.splice(pos, 0, v)
  }
  return out
}
