// Independent implementation, written without reference to reference.js.
export default (grid) => {
  // Union-find over open cells, counting the surviving roots.
  const rows = grid.length
  const cols = grid[0].length
  const parent = new Int32Array(rows * cols).fill(-1)
  const id = (r, c) => r * cols + c
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  let open = 0
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] === 0) { parent[id(r, c)] = id(r, c); open++ }
  }
  let merges = 0
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] !== 0) continue
    for (const [nr, nc] of [[r + 1, c], [r, c + 1]]) {
      if (nr >= rows || nc >= cols || grid[nr][nc] !== 0) continue
      const a = find(id(r, c))
      const b = find(id(nr, nc))
      if (a !== b) { parent[a] = b; merges++ }
    }
  }
  return open - merges
}
