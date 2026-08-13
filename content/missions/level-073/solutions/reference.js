// Reference solution. Correct and optimal. Never shown to the player.
export default (jobs) => {
  const sorted = [...jobs].sort((a, b) => a - b)
  let elapsed = 0
  let total = 0
  for (const d of sorted) {
    elapsed += d
    total += elapsed
  }
  return total
}
