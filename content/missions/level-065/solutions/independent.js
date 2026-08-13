// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Union-find: start with n pieces and lose one per effective merge.
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  let pieces = n
  for (const e of edges) {
    const a = find(e[0])
    const b = find(e[1])
    if (a !== b) { parent[a] = b; pieces-- }
  }
  return pieces
}
