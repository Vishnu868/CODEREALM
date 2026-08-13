// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  let best = 0
  const depth = (i) => {
    if (i >= tree.length || tree[i] === null) return 0
    const left = depth(2 * i + 1)
    const right = depth(2 * i + 2)
    if (left + right > best) best = left + right
    return 1 + Math.max(left, right)
  }
  depth(0)
  return best
}
