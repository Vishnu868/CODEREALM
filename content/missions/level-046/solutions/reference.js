// Reference solution. Correct and optimal. Never shown to the player.
export default (nodes, head) => {
  if (head === -1) return false
  let slow = head
  let fast = head
  while (true) {
    if (nodes[fast][1] === -1) return false
    const next = nodes[nodes[fast][1]][1]
    if (next === -1) return false
    slow = nodes[slow][1]
    fast = next
    if (slow === fast) return true
  }
}
