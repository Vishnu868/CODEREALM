// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  const depth = (i) => {
    if (i >= tree.length || tree[i] === null) return 0
    return 1 + Math.max(depth(2 * i + 1), depth(2 * i + 2))
  }
  return depth(0)
}
