// Independent implementation, written without reference to reference.js.
export default (sizes, target) => {
  // Breadth-first over reachable totals: the first arrival uses fewest cells.
  if (target === 0) return 0
  const seen = new Array(target + 1).fill(false)
  seen[0] = true
  let frontier = [0]
  let used = 0
  while (frontier.length > 0) {
    used++
    const next = []
    for (const total of frontier) {
      for (const size of sizes) {
        const reached = total + size
        if (reached > target || seen[reached]) continue
        if (reached === target) return used
        seen[reached] = true
        next.push(reached)
      }
    }
    frontier = next
  }
  return -1
}
