// Independent implementation, written without reference to reference.js.
export default (nodes, head) => {
  const seen = new Set()
  let at = head
  while (at !== -1) {
    if (seen.has(at)) return true
    seen.add(at)
    at = nodes[at][1]
  }
  return false
}
