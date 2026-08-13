// Reference solution. Correct and optimal. Never shown to the player.
const power = (base, exp) => {
  if (exp === 0) return 1
  const half = power(base, Math.floor(exp / 2))
  return exp % 2 === 0 ? half * half : base * half * half
}
export default power
