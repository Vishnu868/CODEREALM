// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const neighbours = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    neighbours[u].push(v)
    neighbours[v].push(u)
  }
  const seen = new Array(n).fill(false)
  let pieces = 0
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue
    pieces++
    seen[start] = true
    const stack = [start]
    while (stack.length > 0) {
      const node = stack.pop()
      for (const next of neighbours[node]) {
        if (!seen[next]) { seen[next] = true; stack.push(next) }
      }
    }
  }
  return pieces
}
