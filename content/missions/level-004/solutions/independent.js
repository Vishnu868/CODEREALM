// Independent implementation, written WITHOUT looking at reference.js.
// The verifier requires these two to agree on thousands of generated cases.
// If they disagree, one of them is wrong — that is the entire point.
export default (readings) => {
  const sorted = [...readings].sort((x, y) => x - y)
  return sorted[sorted.length - 1] - sorted[0]
}
