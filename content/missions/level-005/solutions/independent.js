// Independent implementation, written WITHOUT looking at reference.js.
// The verifier requires these two to agree on thousands of generated cases.
// If they disagree, one of them is wrong — that is the entire point.
export default (ids) => {
  const counts = new Map()
  for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1)
  const keys = [...counts.keys()].sort((a, b) => a - b)
  let best = keys[0]
  for (const k of keys) if (counts.get(k) > counts.get(best)) best = k
  return best
}
