// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, edges) => {
  // Relax every edge repeatedly until nothing changes.
  const dist = new Array(n).fill(-1)
  dist[0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (const [u, v] of edges) {
      if (dist[u] !== -1 && (dist[v] === -1 || dist[v] > dist[u] + 1)) { dist[v] = dist[u] + 1; changed = true }
      if (dist[v] !== -1 && (dist[u] === -1 || dist[u] > dist[v] + 1)) { dist[u] = dist[v] + 1; changed = true }
    }
  }
  return dist
}
