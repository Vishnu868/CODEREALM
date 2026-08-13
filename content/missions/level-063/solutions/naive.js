// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, edges) => {
  // Sweep the whole edge list repeatedly until the reachable set stops growing.
  const seen = new Array(n).fill(false)
  seen[0] = true
  let changed = true
  while (changed) {
    changed = false
    for (const [u, v] of edges) {
      if (seen[u] && !seen[v]) { seen[v] = true; changed = true }
      if (seen[v] && !seen[u]) { seen[u] = true; changed = true }
    }
  }
  const out = []
  for (let i = 0; i < n; i++) if (seen[i]) out.push(i)
  return out
}
