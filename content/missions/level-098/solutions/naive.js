// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, links) => {
  // Same greedy order, but answering "already connected?" by re-walking.
  const sorted = [...links].sort((a, b) => a[2] - b[2])
  const chosen = Array.from({ length: n }, () => [])
  const connected = (u, v) => {
    const seen = new Array(n).fill(false)
    seen[u] = true
    const stack = [u]
    while (stack.length > 0) {
      const node = stack.pop()
      if (node === v) return true
      for (const next of chosen[node]) if (!seen[next]) { seen[next] = true; stack.push(next) }
    }
    return false
  }
  let taken = 0
  let total = 0
  for (const [u, v, w] of sorted) {
    if (connected(u, v)) continue
    chosen[u].push(v)
    chosen[v].push(u)
    total += w
    taken++
    if (taken === n - 1) break
  }
  return taken === n - 1 ? total : -1
}
