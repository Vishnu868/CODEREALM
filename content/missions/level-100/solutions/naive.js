// Deliberately naive. The verifier asserts this fails the performance gate.
export default (n, activation, links) => {
  // Same greedy order, but checking connectivity by re-walking each time.
  const all = []
  for (let i = 0; i < n; i++) all.push([n, i, activation[i]])
  for (const l of links) all.push([l[0], l[1], l[2]])
  all.sort((a, b) => a[2] - b[2])
  const chosen = Array.from({ length: n + 1 }, () => [])
  const connected = (u, v) => {
    const seen = new Array(n + 1).fill(false)
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
  for (const [u, v, w] of all) {
    if (connected(u, v)) continue
    chosen[u].push(v)
    chosen[v].push(u)
    total += w
    taken++
    if (taken === n) break
  }
  return total
}
