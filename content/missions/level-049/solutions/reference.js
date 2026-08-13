// Reference solution. Correct and optimal. Never shown to the player.
export default (readings) => {
  const out = new Array(readings.length).fill(-1)
  const waiting = []
  for (let i = 0; i < readings.length; i++) {
    while (waiting.length > 0 && readings[waiting[waiting.length - 1]] < readings[i]) {
      out[waiting.pop()] = readings[i]
    }
    waiting.push(i)
  }
  return out
}
