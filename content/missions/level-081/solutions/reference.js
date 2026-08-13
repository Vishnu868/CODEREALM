// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (n) => {
  let twoBack = 1
  let oneBack = 1
  if (n === 0) return 1
  for (let i = 2; i <= n; i++) {
    const current = oneBack + twoBack
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}
