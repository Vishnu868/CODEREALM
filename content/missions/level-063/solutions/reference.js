// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const neighbours = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    neighbours[u].push(v)
    neighbours[v].push(u)
  }
  const seen = new Array(n).fill(false)
  seen[0] = true
  const stack = [0]
  while (stack.length > 0) {
    const node = stack.pop()
    for (const next of neighbours[node]) {
      if (!seen[next]) { seen[next] = true; stack.push(next) }
    }
  }
  const out = []
  for (let i = 0; i < n; i++) if (seen[i]) out.push(i)
  return out
}
