// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // An in-order walk of a valid search tree is strictly increasing.
  const values = []
  const walk = (i) => {
    if (i >= tree.length || tree[i] === null) return
    walk(2 * i + 1)
    values.push(tree[i])
    walk(2 * i + 2)
  }
  walk(0)
  for (let i = 1; i < values.length; i++) if (values[i] <= values[i - 1]) return false
  return true
}
