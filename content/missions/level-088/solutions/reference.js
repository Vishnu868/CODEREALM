// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (a, b) => {
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) table[i][0] = i
  for (let j = 0; j <= b.length; j++) table[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) table[i][j] = table[i - 1][j - 1]
      else table[i][j] = 1 + Math.min(table[i - 1][j - 1], table[i - 1][j], table[i][j - 1])
    }
  }
  return table[a.length][b.length]
}
