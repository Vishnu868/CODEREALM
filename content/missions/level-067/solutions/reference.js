// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const neighbours = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    neighbours[u].push(v)
    neighbours[v].push(u)
  }
  const colour = new Array(n).fill(-1)
  for (let start = 0; start < n; start++) {
    if (colour[start] !== -1) continue
    colour[start] = 0
    const stack = [start]
    while (stack.length > 0) {
      const node = stack.pop()
      for (const next of neighbours[node]) {
        if (colour[next] === -1) {
          colour[next] = 1 - colour[node]
          stack.push(next)
        } else if (colour[next] === colour[node]) return false
      }
    }
  }
  return true
}
