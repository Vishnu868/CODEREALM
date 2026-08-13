// Reference solution. Correct and optimal. Never shown to the player.
export default (a, b) => {
  const at = (tree, i) => (i < tree.length ? tree[i] : null)
  const same = (i) => {
    const x = at(a, i)
    const y = at(b, i)
    if (x === null && y === null) return true
    if (x === null || y === null) return false
    if (x !== y) return false
    return same(2 * i + 1) && same(2 * i + 2)
  }
  return same(0)
}
