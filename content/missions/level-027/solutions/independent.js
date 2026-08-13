// Independent implementation, written without reference to reference.js.
export default (stream) => {
  // Same window, but shrinking one step at a time with a set.
  const inWindow = new Set()
  let left = 0
  let best = 0
  for (let right = 0; right < stream.length; right++) {
    while (inWindow.has(stream[right])) {
      inWindow.delete(stream[left])
      left++
    }
    inWindow.add(stream[right])
    best = Math.max(best, right - left + 1)
  }
  return best
}
