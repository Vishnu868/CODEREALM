// Reference solution. Correct and optimal. Never shown to the player.
export default (readings) => {
  let count = 0
  for (let i = 0; i < readings.length; i++) {
    if (readings[i] > 50) count++
  }
  return count
}
