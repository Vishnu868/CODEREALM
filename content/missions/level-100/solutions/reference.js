// Reference solution. Correct and optimal. Iterative throughout.
export default (n, activation, links) => {
  // Model activation as a link to a virtual source node numbered n, then take
  // the cheapest set of links connecting everything.
  const all = []
  for (let i = 0; i < n; i++) all.push([n, i, activation[i]])
  for (const [u, v, w] of links) all.push([u, v, w])
  all.sort((a, b) => a[2] - b[2])

  const parent = new Int32Array(n + 1)
  for (let i = 0; i <= n; i++) parent[i] = i
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }

  let taken = 0
  let total = 0
  for (const [u, v, w] of all) {
    const a = find(u)
    const b = find(v)
    if (a === b) continue
    parent[a] = b
    total += w
    taken++
    if (taken === n) break
  }
  return total
}
