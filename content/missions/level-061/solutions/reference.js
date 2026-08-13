// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const counts = new Array(n).fill(0)
  for (const [u, v] of edges) {
    counts[u]++
    counts[v]++
  }
  return counts
}
