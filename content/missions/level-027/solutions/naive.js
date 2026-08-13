// Deliberately naive. The verifier asserts this fails the performance gate.
export default (stream) => {
  let best = 0
  for (let i = 0; i < stream.length; i++) {
    const seen = new Set()
    let j = i
    while (j < stream.length && !seen.has(stream[j])) { seen.add(stream[j]); j++ }
    if (j - i > best) best = j - i
  }
  return best
}
