// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, edges) => {
  // Relax the whole edge list repeatedly until nothing improves.
  const depth = new Int32Array(n)
  let changed = true
  while (changed) {
    changed = false
    for (const [u, v] of edges) {
      if (depth[u] + 1 > depth[v]) { depth[v] = depth[u] + 1; changed = true }
    }
  }
  let best = 0
  for (let i = 0; i < n; i++) if (depth[i] > best) best = depth[i]
  return best
}
