// Reference solution. Correct and optimal. Iterative throughout.
export default (n, edges) => {
  const outgoing = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) outgoing[u].push(v)
  const depth = new Int32Array(n)
  let best = 0
  for (let task = 0; task < n; task++) {
    if (depth[task] > best) best = depth[task]
    for (const next of outgoing[task]) {
      if (depth[task] + 1 > depth[next]) depth[next] = depth[task] + 1
    }
  }
  return best
}
