// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Pull form: each task takes the deepest of its predecessors.
  const incoming = Array.from({ length: n }, () => [])
  for (const e of edges) incoming[e[1]].push(e[0])
  const depth = new Int32Array(n)
  let best = 0
  for (let task = 0; task < n; task++) {
    for (const from of incoming[task]) {
      if (depth[from] + 1 > depth[task]) depth[task] = depth[from] + 1
    }
    if (depth[task] > best) best = depth[task]
  }
  return best
}
