// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (cells) => {
  let including = 0
  let excluding = 0
  for (const charge of cells) {
    const nextIncluding = excluding + charge
    excluding = Math.max(excluding, including)
    including = nextIncluding
  }
  return Math.max(including, excluding)
}
