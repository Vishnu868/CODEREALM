// Independent implementation, written without reference to reference.js.
export default (tree, a, b) => {
  // Collect both root-to-node paths and take the last shared entry.
  const pathTo = (target) => {
    const path = []
    let i = 0
    while (i < tree.length && tree[i] !== null) {
      path.push(tree[i])
      if (tree[i] === target) return path
      i = target < tree[i] ? 2 * i + 1 : 2 * i + 2
    }
    return path
  }
  const p = pathTo(a)
  const q = pathTo(b)
  let best = p[0]
  for (let i = 0; i < Math.min(p.length, q.length); i++) {
    if (p[i] === q[i]) best = p[i]
    else break
  }
  return best
}
