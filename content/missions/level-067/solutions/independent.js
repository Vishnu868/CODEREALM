// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Breadth-first layering: depth parity is the label.
  const neighbours = Array.from({ length: n }, () => [])
  for (const e of edges) {
    neighbours[e[0]].push(e[1])
    neighbours[e[1]].push(e[0])
  }
  const depth = new Array(n).fill(-1)
  for (let start = 0; start < n; start++) {
    if (depth[start] !== -1) continue
    depth[start] = 0
    const queue = [start]
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i]
      for (const nb of neighbours[node]) {
        if (depth[nb] === -1) { depth[nb] = depth[node] + 1; queue.push(nb) }
        else if ((depth[nb] - depth[node]) % 2 === 0) return false
      }
    }
  }
  return true
}
