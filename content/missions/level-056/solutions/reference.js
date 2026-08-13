// Reference solution. Correct and optimal. Never shown to the player.
export default (tree, target) => {
  let i = 0
  while (i < tree.length && tree[i] !== null) {
    if (tree[i] === target) return true
    i = target < tree[i] ? 2 * i + 1 : 2 * i + 2
  }
  return false
}
