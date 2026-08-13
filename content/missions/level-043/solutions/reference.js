// Reference solution. Correct and optimal. Never shown to the player.
export default (nodes, head) => {
  let total = 0
  let at = head
  while (at !== -1) {
    total += nodes[at][0]
    at = nodes[at][1]
  }
  return total
}
