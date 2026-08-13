// Reference solution. Correct and optimal. Never shown to the player.
export default (grid, word) => {
  if (word.length === 0) return true
  const rows = grid.length
  const cols = grid[0].length
  const used = Array.from({ length: rows }, () => new Array(cols).fill(false))
  const walk = (r, c, at) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false
    if (used[r][c] || grid[r][c] !== word[at]) return false
    if (at === word.length - 1) return true
    used[r][c] = true
    const found = walk(r - 1, c, at + 1) || walk(r + 1, c, at + 1) ||
                  walk(r, c - 1, at + 1) || walk(r, c + 1, at + 1)
    used[r][c] = false
    return found
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (walk(r, c, 0)) return true
  }
  return false
}
