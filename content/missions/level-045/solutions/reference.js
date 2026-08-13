// Reference solution. Correct and optimal. Never shown to the player.
export default (nodes, head) => {
  if (head === -1) return -1
  let slow = head
  let fast = head
  while (nodes[fast][1] !== -1 && nodes[nodes[fast][1]][1] !== -1) {
    slow = nodes[slow][1]
    fast = nodes[nodes[fast][1]][1]
  }
  // Even length: step once more so the second middle node wins.
  if (nodes[fast][1] !== -1) slow = nodes[slow][1]
  return nodes[slow][0]
}
