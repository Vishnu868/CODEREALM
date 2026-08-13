// Independent implementation, written without reference to reference.js.
export default (cells, k) => {
  // Track each group running total instead of filling one at a time.
  if (k > cells.length) return false
  const total = cells.reduce((a, b) => a + b, 0)
  if (total % k !== 0) return false
  const target = total / k
  const sorted = [...cells].sort((a, b) => b - a)
  if (sorted[0] > target) return false
  const groups = new Array(k).fill(0)
  const place = (i) => {
    if (i === sorted.length) return groups.every((g) => g === target)
    const tried = new Set()
    for (let g = 0; g < k; g++) {
      if (groups[g] + sorted[i] > target || tried.has(groups[g])) continue
      tried.add(groups[g])
      groups[g] += sorted[i]
      if (place(i + 1)) return true
      groups[g] -= sorted[i]
    }
    return false
  }
  return place(0)
}
