// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (rows, cols) => {
  const table = Array.from({ length: rows }, () => new Array(cols).fill(1))
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) table[r][c] = table[r - 1][c] + table[r][c - 1]
  }
  return table[rows - 1][cols - 1]
}
