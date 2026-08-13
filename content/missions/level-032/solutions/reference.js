// Reference solution. Correct and optimal. Never shown to the player.
export default (table, targets) => targets.map((target) => {
  let lo = 0
  let hi = table.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (table[mid] === target) return mid
    if (table[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
})
