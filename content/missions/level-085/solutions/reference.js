// Reference solution. Correct and optimal. Bottom-up rather than recursive:
// Pyodide's default recursion limit is 1,000 frames.
export default (masses, values, capacity) => {
  const best = new Array(capacity + 1).fill(0)
  for (let i = 0; i < masses.length; i++) {
    // Downward, so each item is used at most once.
    for (let c = capacity; c >= masses[i]; c--) {
      const candidate = best[c - masses[i]] + values[i]
      if (candidate > best[c]) best[c] = candidate
    }
  }
  return best[capacity]
}
