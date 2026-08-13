// Reference solution. Correct and optimal. Never shown to the player.
export default (readings, target) => {
  const counts = new Map([[0, 1]])
  let running = 0
  let found = 0
  for (const r of readings) {
    running += r
    found += counts.get(running - target) || 0
    counts.set(running, (counts.get(running) || 0) + 1)
  }
  return found
}
