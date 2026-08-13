// Independent implementation, written without reference to reference.js.
export default (grid) => {
  // A single rolling row of counts.
  const cols = grid[0].length
  const counts = new Array(cols).fill(0)
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) { counts[c] = 0; continue }
      if (r === 0 && c === 0) { counts[c] = 1; continue }
      counts[c] += c > 0 ? counts[c - 1] : 0
    }
  }
  return counts[cols - 1]
}
