// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  const counts = []
  for (let i = 0; i < n; i++) {
    let c = 0
    for (const e of edges) if (e[0] === i || e[1] === i) c++
    counts.push(c)
  }
  return counts
}
