// Independent implementation, written without reference to reference.js.
export default (a, b) => {
  // Only the previous row is ever needed.
  let previous = new Array(b.length + 1).fill(0)
  for (let i = 1; i <= a.length; i++) {
    const current = new Array(b.length + 1).fill(0)
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) current[j] = previous[j - 1] + 1
      else current[j] = Math.max(previous[j], current[j - 1])
    }
    previous = current
  }
  return previous[b.length]
}
