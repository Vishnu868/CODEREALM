// Reference solution. Correct and optimal. Never shown to the player.
export default (rows, cols) => {
  let count = 0
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if ((r * c) % 3 === 0) count++
    }
  }
  return count
}
