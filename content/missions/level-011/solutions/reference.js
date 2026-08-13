// Reference solution. Correct and optimal. Never shown to the player.
export default (readings) => {
  for (let i = 1; i < readings.length; i++) {
    if (readings[i] > readings[i - 1]) return i
  }
  return -1
}
