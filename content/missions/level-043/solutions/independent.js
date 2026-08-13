// Independent implementation, written without reference to reference.js.
export default (nodes, head) => {
  const values = []
  for (let at = head; at !== -1; at = nodes[at][1]) values.push(nodes[at][0])
  return values.reduce((a, b) => a + b, 0)
}
