// Reference solution. Correct and optimal. Never shown to the player.
export default (a, b) => {
  if (a.length !== b.length) return false
  const counts = new Map()
  for (const ch of a) counts.set(ch, (counts.get(ch) || 0) + 1)
  for (const ch of b) {
    const left = counts.get(ch)
    if (!left) return false
    counts.set(ch, left - 1)
  }
  return true
}
