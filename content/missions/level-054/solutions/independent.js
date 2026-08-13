// Independent implementation, written without reference to reference.js.
export default (a, b) => {
  // Compare the arrays after padding both to the same length.
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const x = i < a.length ? a[i] : null
    const y = i < b.length ? b[i] : null
    if (x !== y) return false
  }
  return true
}
