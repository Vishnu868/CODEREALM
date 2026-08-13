// Independent implementation, written without reference to reference.js.
export default (grid) => {
  // Expand a frontier level by level instead of using a queue.
  const rows = grid.length
  const cols = grid[0].length
  if (grid[0][0] !== 0 || grid[rows - 1][cols - 1] !== 0) return -1
  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false))
  seen[0][0] = true
  let frontier = [[0, 0]]
  let steps = 0
  while (frontier.length > 0) {
    const next = []
    for (const [r, c] of frontier) {
      if (r === rows - 1 && c === cols - 1) return steps
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        if (grid[nr][nc] !== 0 || seen[nr][nc]) continue
        seen[nr][nc] = true
        next.push([nr, nc])
      }
    }
    frontier = next
    steps++
  }
  return -1
}
