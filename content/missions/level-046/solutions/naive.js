// Deliberately naive. The verifier asserts this fails the performance gate.
export default (nodes, head) => {
  // Re-walk from the head at every step to check for a revisit.
  let at = head
  let steps = 0
  while (at !== -1) {
    let probe = head
    for (let i = 0; i < steps; i++) {
      if (probe === at) return true
      probe = nodes[probe][1]
    }
    at = nodes[at][1]
    steps++
  }
  return false
}
