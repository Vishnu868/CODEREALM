// Independent implementation, written without reference to reference.js.
export default (a, b) => {
  const setB = new Set(b)
  const out = []
  const seen = new Set()
  for (const v of a) {
    if (setB.has(v) && !seen.has(v)) { seen.add(v); out.push(v) }
  }
  return out.sort((x, y) => x - y)
}
