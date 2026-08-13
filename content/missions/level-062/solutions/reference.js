// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const neighbours = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    neighbours[u].push(v)
    neighbours[v].push(u)
  }
  const dist = new Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  let head = 0
  while (head < queue.length) {
    const node = queue[head++]
    for (const next of neighbours[node]) {
      if (dist[next] === -1) {
        dist[next] = dist[node] + 1
        queue.push(next)
      }
    }
  }
  return dist
}
