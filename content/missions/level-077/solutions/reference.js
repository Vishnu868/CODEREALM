// Reference solution. Correct and optimal. Never shown to the player.
export default (sizes, target) => {
  const count = (i, remaining) => {
    if (remaining === 0) return 1
    if (remaining < 0 || i >= sizes.length) return 0
    return count(i, remaining - sizes[i]) + count(i + 1, remaining)
  }
  return count(0, target)
}
