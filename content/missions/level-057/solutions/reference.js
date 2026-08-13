// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  const check = (i, low, high) => {
    if (i >= tree.length || tree[i] === null) return true
    const v = tree[i]
    if (v <= low || v >= high) return false
    return check(2 * i + 1, low, v) && check(2 * i + 2, v, high)
  }
  return check(0, -Infinity, Infinity)
}
