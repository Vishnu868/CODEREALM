// Reference solution. Correct and optimal. Never shown to the player.
export default (strengths, k) => {
  if (k < 1 || k > strengths.length) return -1
  const sorted = [...strengths].sort((x, y) => y - x)
  return sorted[k - 1]
}
