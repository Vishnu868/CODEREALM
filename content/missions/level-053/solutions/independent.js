// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // The deepest existing index determines the depth directly.
  let best = 0
  for (let i = 0; i < tree.length; i++) {
    if (tree[i] !== null) best = Math.max(best, Math.floor(Math.log2(i + 1)) + 1)
  }
  return best
}
