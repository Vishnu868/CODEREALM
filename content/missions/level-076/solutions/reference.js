// Reference solution. Correct and optimal. Never shown to the player.
export default (relays, k) => {
  if (k < 0 || k > relays.length) return []
  const out = []
  const partial = []
  const build = (start) => {
    if (partial.length === k) { out.push([...partial]); return }
    for (let i = start; i < relays.length; i++) {
      if (relays.length - i < k - partial.length) break
      partial.push(relays[i])
      build(i + 1)
      partial.pop()
    }
  }
  build(0)
  return out
}
