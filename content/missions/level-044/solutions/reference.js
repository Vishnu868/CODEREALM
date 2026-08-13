// Reference solution. Correct and optimal. Never shown to the player.
export default (nodes, head) => {
  const out = []
  for (let at = head; at !== -1; at = nodes[at][1]) out.push(nodes[at][0])
  out.reverse()
  return out
}
