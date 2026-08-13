// Independent implementation, written without reference to reference.js.
export default (a, b) => {
  // Rolling single row.
  let previous = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) previous[j] = j
  for (let i = 1; i <= a.length; i++) {
    const current = new Array(b.length + 1)
    current[0] = i
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1]
        ? previous[j - 1]
        : 1 + Math.min(previous[j - 1], previous[j], current[j - 1])
    }
    previous = current
  }
  return previous[b.length]
}
