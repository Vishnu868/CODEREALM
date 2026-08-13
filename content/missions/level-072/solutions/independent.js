// Independent implementation, written without reference to reference.js.
export default (windows) => {
  // One combined event list: ends before starts at the same instant.
  const events = []
  for (const [s, e] of windows) {
    events.push([s, 1])
    events.push([e, -1])
  }
  events.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]))
  let open = 0
  let best = 0
  for (const [, delta] of events) {
    open += delta
    if (open > best) best = open
  }
  return best
}
