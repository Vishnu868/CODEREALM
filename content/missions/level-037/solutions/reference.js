// Reference solution. Correct and optimal. Never shown to the player.
export default (channels) => {
  const counts = new Map()
  for (const c of channels) counts.set(c, (counts.get(c) || 0) + 1)
  return [...counts.keys()].sort((x, y) => {
    const d = counts.get(y) - counts.get(x)
    return d !== 0 ? d : x - y
  })
}
