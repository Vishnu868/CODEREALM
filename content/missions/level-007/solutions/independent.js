// Independent implementation, written without reference to reference.js.
export default (rows, cols) => {
  // Counting argument: a cell is resonant unless neither index is a multiple of 3.
  const rMul = Math.floor(rows / 3)
  const cMul = Math.floor(cols / 3)
  return rows * cols - (rows - rMul) * (cols - cMul)
}
