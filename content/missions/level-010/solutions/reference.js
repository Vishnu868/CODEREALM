// Reference solution. Correct and optimal. Never shown to the player.
export default (readings) => {
  let total = 0
  let seen = 0
  for (const r of readings) {
    if (r >= 20 && r <= 80) { total += r; seen++ }
  }
  return seen === 0 ? -1 : total
}
