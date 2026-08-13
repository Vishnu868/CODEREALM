// Independent implementation, written without reference to reference.js.
export default (masses, values, capacity) => {
  // Two-dimensional table: one row per item considered.
  const n = masses.length
  let previous = new Array(capacity + 1).fill(0)
  for (let i = 0; i < n; i++) {
    const current = new Array(capacity + 1).fill(0)
    for (let c = 0; c <= capacity; c++) {
      current[c] = previous[c]
      if (masses[i] <= c) {
        const taken = previous[c - masses[i]] + values[i]
        if (taken > current[c]) current[c] = taken
      }
    }
    previous = current
  }
  return previous[capacity]
}
