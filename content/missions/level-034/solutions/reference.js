// Reference solution. Correct and optimal. Never shown to the player.
export default (table, target) => {
  let lo = 0
  let hi = table.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (table[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}
