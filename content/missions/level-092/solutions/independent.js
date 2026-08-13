// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // Walk every root-to-leaf path explicitly with a stack of [index, sum].
  const n = tree.length
  if (n === 0 || tree[0] === null) return 0
  let best = -Infinity
  const stack = [[0, 0]]
  while (stack.length > 0) {
    const [i, sum] = stack.pop()
    const total = sum + tree[i]
    const left = 2 * i + 1 < n && tree[2 * i + 1] !== null ? 2 * i + 1 : -1
    const right = 2 * i + 2 < n && tree[2 * i + 2] !== null ? 2 * i + 2 : -1
    if (left === -1 && right === -1) { if (total > best) best = total; continue }
    if (left !== -1) stack.push([left, total])
    if (right !== -1) stack.push([right, total])
  }
  return best
}
