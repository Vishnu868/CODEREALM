// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Expand one frontier at a time rather than using an explicit queue.
  const neighbours = Array.from({ length: n }, () => [])
  for (const e of edges) {
    neighbours[e[0]].push(e[1])
    neighbours[e[1]].push(e[0])
  }
  const dist = new Array(n).fill(-1)
  if (n === 0) return dist
  dist[0] = 0
  let frontier = [0]
  let step = 0
  while (frontier.length > 0) {
    step++
    const next = []
    for (const node of frontier) {
      for (const nb of neighbours[node]) {
        if (dist[nb] === -1) { dist[nb] = step; next.push(nb) }
      }
    }
    frontier = next
  }
  return dist
}
