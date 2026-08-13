// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (prices) => {
  let holding = -Infinity
  let justSold = -Infinity
  let free = 0
  for (const price of prices) {
    const previousHolding = holding
    const previousSold = justSold
    holding = Math.max(previousHolding, free - price)
    justSold = previousHolding + price
    free = Math.max(free, previousSold)
  }
  return Math.max(0, free, justSold)
}
