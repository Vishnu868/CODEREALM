// Reference solution. Correct and optimal. Never shown to the player.
export default (a, b) => {
  const inA = new Set(a)
  const shared = new Set()
  for (const v of b) if (inA.has(v)) shared.add(v)
  return [...shared].sort((x, y) => x - y)
}
