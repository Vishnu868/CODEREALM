// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (grid) => {
  const rows = grid.length
  const cols = grid[0].length
  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false))
  let regions = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0 || seen[r][c]) continue
      regions++
      seen[r][c] = true
      const stack = [[r, c]]
      while (stack.length > 0) {
        const [y, x] = stack.pop()
        const steps = [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]]
        for (const [ny, nx] of steps) {
          if (ny < 0 || nx < 0 || ny >= rows || nx >= cols) continue
          if (grid[ny][nx] !== 0 || seen[ny][nx]) continue
          seen[ny][nx] = true
          stack.push([ny, nx])
        }
      }
    }
  }
  return regions
}
