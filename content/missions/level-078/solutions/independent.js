// Independent implementation, written without reference to reference.js.
export default (grid, word) => {
  // Carry the set of used cells explicitly rather than marking the grid.
  if (word.length === 0) return true
  const rows = grid.length
  const cols = grid[0].length
  const walk = (r, c, at, used) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false
    const key = r * cols + c
    if (used.has(key) || grid[r][c] !== word[at]) return false
    if (at === word.length - 1) return true
    const next = new Set(used)
    next.add(key)
    return walk(r - 1, c, at + 1, next) || walk(r + 1, c, at + 1, next) ||
           walk(r, c - 1, at + 1, next) || walk(r, c + 1, at + 1, next)
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (walk(r, c, 0, new Set())) return true
  }
  return false
}
