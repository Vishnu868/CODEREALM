// Reference solution. Correct and optimal. Never shown to the player.
export default (readings, k) => {
  if (k < 1 || k > readings.length) return -1
  let sum = 0
  for (let i = 0; i < k; i++) sum += readings[i]
  let best = sum
  for (let i = k; i < readings.length; i++) {
    sum += readings[i] - readings[i - k]
    if (sum > best) best = sum
  }
  return best
}
