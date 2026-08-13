// Reference solution. Correct and optimal. Iterative throughout.
export default (tree) => {
  const n = tree.length
  if (n === 0 || tree[0] === null) return 0
  const best = new Array(n).fill(null)
  for (let i = n - 1; i >= 0; i--) {
    if (tree[i] === null) continue
    const l = 2 * i + 1 < n ? best[2 * i + 1] : null
    const r = 2 * i + 2 < n ? best[2 * i + 2] : null
    if (l === null && r === null) best[i] = tree[i]
    else if (l === null) best[i] = tree[i] + r
    else if (r === null) best[i] = tree[i] + l
    else best[i] = tree[i] + Math.max(l, r)
  }
  return best[0]
}
