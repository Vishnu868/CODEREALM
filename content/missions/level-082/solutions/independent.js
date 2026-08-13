// Independent implementation, written without reference to reference.js.
export default (rows, cols) => {
  // The answer is a binomial coefficient: choose which of the moves go down.
  const down = rows - 1
  const right = cols - 1
  let result = 1
  for (let i = 1; i <= down; i++) result = result * (right + i) / i
  return Math.round(result)
}
