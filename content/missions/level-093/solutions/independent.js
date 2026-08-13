// Independent implementation, written without reference to reference.js.
export default (sections, k) => {
  // Count groups needed for a cap, then binary search using that count.
  const groupsNeeded = (cap) => {
    let groups = 1
    let load = 0
    for (let i = 0; i < sections.length; i++) {
      if (load + sections[i] > cap) { groups++; load = 0 }
      load += sections[i]
    }
    return groups
  }
  let lo = Math.max(...sections)
  let hi = sections.reduce((a, b) => a + b, 0)
  let best = hi
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (groupsNeeded(mid) <= k) { best = mid; hi = mid - 1 }
    else lo = mid + 1
  }
  return best
}
