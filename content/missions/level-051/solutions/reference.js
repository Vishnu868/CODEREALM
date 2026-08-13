// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  const out = []
  const walk = (i) => {
    if (i >= tree.length || tree[i] === null) return
    walk(2 * i + 1)
    out.push(tree[i])
    walk(2 * i + 2)
  }
  walk(0)
  return out
}
