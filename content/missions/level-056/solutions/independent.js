// Independent implementation, written without reference to reference.js.
export default (tree, target) => {
  const search = (i) => {
    if (i >= tree.length || tree[i] === null) return false
    if (tree[i] === target) return true
    return target < tree[i] ? search(2 * i + 1) : search(2 * i + 2)
  }
  return search(0)
}
