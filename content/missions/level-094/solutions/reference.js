// Reference solution. Correct and optimal. Iterative throughout.
export default (grid, k) => {
  const rows = grid.length
  const cols = grid[0].length
  const seen = new Set([`0:0:${k}`])
  let frontier = [[0, 0, k]]
  let steps = 0
  while (frontier.length > 0) {
    const next = []
    for (const [r, c, left] of frontier) {
      if (r === rows - 1 && c === cols - 1) return steps
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        const cost = grid[nr][nc] === 1 ? 1 : 0
        const remaining = left - cost
        if (remaining < 0) continue
        const key = `${nr}:${nc}:${remaining}`
        if (seen.has(key)) continue
        seen.add(key)
        next.push([nr, nc, remaining])
      }
    }
    frontier = next
    steps++
  }
  return -1
}
