// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Relax every edge n-1 times; slower, but a completely different argument.
  const best = new Array(n).fill(Infinity)
  best[0] = 0
  for (let round = 0; round < n; round++) {
    let changed = false
    for (const e of edges) {
      const [u, v, w] = e
      if (best[u] + w < best[v]) { best[v] = best[u] + w; changed = true }
      if (best[v] + w < best[u]) { best[u] = best[v] + w; changed = true }
    }
    if (!changed) break
  }
  return best[n - 1] === Infinity ? -1 : best[n - 1]
}
