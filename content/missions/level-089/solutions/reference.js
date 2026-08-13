// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (grid) => {
  const rows = grid.length
  const cols = grid[0].length
  const table = Array.from({ length: rows }, () => new Array(cols).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) continue
      if (r === 0 && c === 0) { table[r][c] = 1; continue }
      const above = r > 0 ? table[r - 1][c] : 0
      const left = c > 0 ? table[r][c - 1] : 0
      table[r][c] = above + left
    }
  }
  return table[rows - 1][cols - 1]
}
