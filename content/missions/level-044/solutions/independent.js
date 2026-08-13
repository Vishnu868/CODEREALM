// Independent implementation, written without reference to reference.js.
export default (nodes, head) => {
  const out = []
  let at = head
  while (at !== -1) {
    out.unshift(nodes[at][0])
    at = nodes[at][1]
  }
  return out
}
