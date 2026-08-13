// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // Depth is known from the index, so bucket by depth directly.
  const levels = []
  for (let i = 0; i < tree.length; i++) {
    if (tree[i] === null) continue
    const depth = Math.floor(Math.log2(i + 1))
    while (levels.length <= depth) levels.push([])
    levels[depth].push(tree[i])
  }
  return levels
}
