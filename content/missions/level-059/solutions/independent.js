// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // Depths computed bottom-up over the array, then the best bend taken.
  const depths = new Array(tree.length).fill(0)
  for (let i = tree.length - 1; i >= 0; i--) {
    if (tree[i] === null) continue
    const l = 2 * i + 1 < tree.length ? depths[2 * i + 1] : 0
    const r = 2 * i + 2 < tree.length ? depths[2 * i + 2] : 0
    depths[i] = 1 + Math.max(l, r)
  }
  let best = 0
  for (let i = 0; i < tree.length; i++) {
    if (tree[i] === null) continue
    const l = 2 * i + 1 < tree.length ? depths[2 * i + 1] : 0
    const r = 2 * i + 2 < tree.length ? depths[2 * i + 2] : 0
    best = Math.max(best, l + r)
  }
  return best
}
