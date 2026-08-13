// Reference solution. Correct and optimal. Iterative throughout.
export default (cells, k) => {
  if (k > cells.length) return false
  const total = cells.reduce((a, b) => a + b, 0)
  if (total % k !== 0) return false
  const target = total / k
  const sorted = [...cells].sort((a, b) => b - a)
  if (sorted[0] > target) return false
  const used = new Array(sorted.length).fill(false)
  const fill = (groupsLeft, current, start) => {
    if (groupsLeft === 0) return true
    if (current === target) return fill(groupsLeft - 1, 0, 0)
    for (let i = start; i < sorted.length; i++) {
      if (used[i] || current + sorted[i] > target) continue
      used[i] = true
      if (fill(groupsLeft, current + sorted[i], i + 1)) return true
      used[i] = false
      if (current === 0) break   // this cell cannot start any group
    }
    return false
  }
  return fill(k, 0, 0)
}
