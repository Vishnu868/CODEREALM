// Reference solution. Correct and optimal. Never shown to the player.
export default (log) => {
  let total = 0
  for (let i = 0; i < log.length; i++) {
    if (log[i] > 0) total += log[i]
  }
  return total
}
