// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (grid) => {
  const rows = grid.length
  const cols = grid[0].length
  if (grid[0][0] !== 0 || grid[rows - 1][cols - 1] !== 0) return -1
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1))
  dist[0][0] = 0
  const queue = [[0, 0]]
  let head = 0
  while (head < queue.length) {
    const [r, c] = queue[head++]
    if (r === rows - 1 && c === cols - 1) return dist[r][c]
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      if (grid[nr][nc] !== 0 || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return -1
}
