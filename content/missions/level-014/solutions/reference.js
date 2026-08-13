// Reference solution. Correct and optimal. Never shown to the player.
export default (addresses) => {
  const seen = new Set()
  for (const a of addresses) {
    if (seen.has(a)) return true
    seen.add(a)
  }
  return false
}
