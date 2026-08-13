// Independent implementation, written without reference to reference.js.
export default (grid, k) => {
  // Best remaining charges per cell per step count, filled by relaxation.
  const rows = grid.length
  const cols = grid[0].length
  const INF = Infinity
  const best = Array.from({ length: rows }, () => Array.from({ length: cols }, () => new Array(k + 1).fill(INF)))
  best[0][0][k] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (let left = 0; left <= k; left++) {
      const here = best[r][c][left]
      if (here === INF) continue
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        const remaining = left - (grid[nr][nc] === 1 ? 1 : 0)
        if (remaining < 0) continue
        if (here + 1 < best[nr][nc][remaining]) { best[nr][nc][remaining] = here + 1; changed = true }
      }
    }
  }
  let answer = INF
  for (let left = 0; left <= k; left++) answer = Math.min(answer, best[rows - 1][cols - 1][left])
  return answer === INF ? -1 : answer
}
