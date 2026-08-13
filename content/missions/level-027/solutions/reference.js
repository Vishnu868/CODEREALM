// Reference solution. Correct and optimal. Never shown to the player.
export default (stream) => {
  const lastSeen = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < stream.length; right++) {
    const ch = stream[right]
    const prev = lastSeen.get(ch)
    if (prev !== undefined && prev >= left) left = prev + 1
    lastSeen.set(ch, right)
    const width = right - left + 1
    if (width > best) best = width
  }
  return best
}
