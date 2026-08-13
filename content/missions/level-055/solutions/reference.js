// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  const out = []
  const walk = (source, target) => {
    if (source >= tree.length || tree[source] === null) return
    while (out.length <= target) out.push(null)
    out[target] = tree[source]
    walk(2 * source + 1, 2 * target + 2)
    walk(2 * source + 2, 2 * target + 1)
  }
  walk(0, 0)
  while (out.length > 0 && out[out.length - 1] === null) out.pop()
  return out
}
