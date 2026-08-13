// Reference solution. Correct and optimal. Never shown to the player.
export default (stream) => {
  const counts = new Map()
  for (const ch of stream) counts.set(ch, (counts.get(ch) || 0) + 1)
  let best = ''
  let bestCount = -1
  for (const [ch, count] of counts) {
    if (count > bestCount || (count === bestCount && ch < best)) { best = ch; bestCount = count }
  }
  return best
}
