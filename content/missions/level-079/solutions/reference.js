// Reference solution. Correct and optimal. Never shown to the player.
export default (n) => {
  const columns = new Set()
  const downward = new Set()
  const upward = new Set()
  const place = (row) => {
    if (row === n) return 1
    let found = 0
    for (let col = 0; col < n; col++) {
      if (columns.has(col) || downward.has(row + col) || upward.has(row - col)) continue
      columns.add(col)
      downward.add(row + col)
      upward.add(row - col)
      found += place(row + 1)
      columns.delete(col)
      downward.delete(row + col)
      upward.delete(row - col)
    }
    return found
  }
  return place(0)
}
