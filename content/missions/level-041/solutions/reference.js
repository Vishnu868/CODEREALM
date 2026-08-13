// Reference solution. Correct and optimal. Never shown to the player.
const descend = (n) => {
  if (n === 1) return 0
  return 1 + (n % 2 === 0 ? descend(n / 2) : descend(n - 1))
}
export default descend
