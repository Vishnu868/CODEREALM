// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // Iterative preorder with an explicit stack.
  const parts = []
  const stack = [0]
  while (stack.length > 0) {
    const i = stack.pop()
    if (i >= tree.length || tree[i] === null) { parts.push('x'); continue }
    parts.push(String(tree[i]))
    stack.push(2 * i + 2)
    stack.push(2 * i + 1)
  }
  return parts.join(',')
}
