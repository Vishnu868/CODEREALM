// Deliberately naive. The verifier asserts this fails the performance gate.
export default (grid) => {
  // Label every open cell, then repeatedly push the smallest label outward
  // until nothing changes, and count the surviving labels.
  const rows = grid.length
  const cols = grid[0].length
  const label = []
  let next = 1
  for (let r = 0; r < rows; r++) {
    label.push([])
    for (let c = 0; c < cols; c++) label[r].push(grid[r][c] === 0 ? next++ : 0)
  }
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (label[r][c] === 0) continue
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
        if (label[nr][nc] === 0) continue
        const lo = Math.min(label[r][c], label[nr][nc])
        if (label[r][c] !== lo || label[nr][nc] !== lo) {
          label[r][c] = lo
          label[nr][nc] = lo
          changed = true
        }
      }
    }
  }
  const distinct = new Set()
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (label[r][c] !== 0) distinct.add(label[r][c])
  }
  return distinct.size
}
