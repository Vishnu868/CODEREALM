// Independent implementation, written without reference to reference.js.
export default (readings, k) => {
  // Track the last position of each value; the window starts just past the
  // earliest last-position once there are too many distinct values.
  if (k === 0) return 0
  const lastSeen = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < readings.length; right++) {
    lastSeen.set(readings[right], right)
    if (lastSeen.size > k) {
      let earliest = Infinity
      let earliestValue = null
      for (const [value, at] of lastSeen) {
        if (at < earliest) { earliest = at; earliestValue = value }
      }
      lastSeen.delete(earliestValue)
      left = earliest + 1
    }
    best = Math.max(best, right - left + 1)
  }
  return best
}
