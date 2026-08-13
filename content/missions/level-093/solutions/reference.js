// Reference solution. Correct and optimal. Iterative throughout.
export default (sections, k) => {
  const fits = (cap) => {
    let groups = 1
    let load = 0
    for (const w of sections) {
      if (load + w > cap) { groups++; load = 0 }
      load += w
    }
    return groups <= k
  }
  let lo = 0
  let hi = 0
  for (const w of sections) { hi += w; if (w > lo) lo = w }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (fits(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}
