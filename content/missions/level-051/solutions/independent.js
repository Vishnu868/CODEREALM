// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // Iterative, with an explicit stack instead of recursion.
  const out = []
  const stack = []
  let i = 0
  while (stack.length > 0 || (i < tree.length && tree[i] !== null)) {
    while (i < tree.length && tree[i] !== null) { stack.push(i); i = 2 * i + 1 }
    const node = stack.pop()
    out.push(tree[node])
    i = 2 * node + 2
  }
  return out
}
