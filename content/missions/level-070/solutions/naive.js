// Deliberately naive. The verifier asserts this fails the performance gate.
export default (grid) => {
  // Sweep the whole grid repeatedly, improving distances until nothing changes.
  const rows = grid.length
  const cols = grid[0].length
  if (grid[0][0] !== 0 || grid[rows - 1][cols - 1] !== 0) return -1
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(Infinity))
  dist[0][0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        if (grid[nr][nc] !== 0) continue
        if (dist[nr][nc] + 1 < dist[r][c]) { dist[r][c] = dist[nr][nc] + 1; changed = true }
      }
    }
  }
  const answer = dist[rows - 1][cols - 1]
  return answer === Infinity ? -1 : answer
}
