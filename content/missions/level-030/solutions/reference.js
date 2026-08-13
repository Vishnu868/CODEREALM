// Reference solution. Correct and optimal. Never shown to the player.
export default (readings) => {
  let best = readings[0]
  let here = readings[0]
  for (let i = 1; i < readings.length; i++) {
    here = Math.max(readings[i], here + readings[i])
    if (here > best) best = here
  }
  return best
}
