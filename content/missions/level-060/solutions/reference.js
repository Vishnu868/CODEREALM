// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  const parts = []
  const walk = (i) => {
    if (i >= tree.length || tree[i] === null) { parts.push('x'); return }
    parts.push(String(tree[i]))
    walk(2 * i + 1)
    walk(2 * i + 2)
  }
  walk(0)
  return parts.join(',')
}
