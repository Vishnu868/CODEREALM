// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, edges) => {
  // Re-sweep the entire edge list from every node.
  const reaches = (start) => {
    const seen = new Array(n).fill(false)
    seen[start] = true
    let changed = true
    while (changed) {
      changed = false
      for (const [u, v] of edges) {
        if (seen[u] && !seen[v]) { seen[v] = true; changed = true }
        if (seen[v] && !seen[u]) { seen[u] = true; changed = true }
      }
    }
    return seen
  }
  const assigned = new Array(n).fill(false)
  let pieces = 0
  for (let i = 0; i < n; i++) {
    if (assigned[i]) continue
    pieces++
    const seen = reaches(i)
    for (let j = 0; j < n; j++) if (seen[j]) assigned[j] = true
  }
  return pieces
}
