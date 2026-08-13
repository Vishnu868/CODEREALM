// Reference solution. Correct and optimal. Iterative throughout.
export default (n, links) => {
  const sorted = [...links].sort((a, b) => a[2] - b[2])
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  let taken = 0
  let total = 0
  for (const [u, v, w] of sorted) {
    const a = find(u)
    const b = find(v)
    if (a === b) continue
    parent[a] = b
    total += w
    taken++
    if (taken === n - 1) break
  }
  return taken === n - 1 ? total : -1
}
