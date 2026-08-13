// Reference solution. Correct and optimal. Never shown to the player.
export default (fragments) => {
  const values = [...fragments].sort((a, b) => a - b)
  const out = []
  const used = new Array(values.length).fill(false)
  const partial = []
  const build = () => {
    if (partial.length === values.length) { out.push([...partial]); return }
    for (let i = 0; i < values.length; i++) {
      if (used[i]) continue
      used[i] = true
      partial.push(values[i])
      build()
      partial.pop()
      used[i] = false
    }
  }
  build()
  return out
}
