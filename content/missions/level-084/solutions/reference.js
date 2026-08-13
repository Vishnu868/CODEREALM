// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (sizes, target) => {
  const best = new Array(target + 1).fill(Infinity)
  best[0] = 0
  for (let total = 1; total <= target; total++) {
    for (const size of sizes) {
      if (size <= total && best[total - size] + 1 < best[total]) best[total] = best[total - size] + 1
    }
  }
  return best[target] === Infinity ? -1 : best[target]
}
