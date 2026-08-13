// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (readings) => {
  const tails = []
  for (const v of readings) {
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < v) lo = mid + 1
      else hi = mid
    }
    if (lo === tails.length) tails.push(v)
    else tails[lo] = v
  }
  return tails.length
}
