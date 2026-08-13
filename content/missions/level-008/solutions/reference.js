// Reference solution. Correct and optimal. Never shown to the player.
export default (readings, offset) => {
  const out = new Array(readings.length)
  for (let i = 0; i < readings.length; i++) {
    const v = readings[i] + offset
    out[i] = v < 0 ? 0 : v > 100 ? 100 : v
  }
  return out
}
