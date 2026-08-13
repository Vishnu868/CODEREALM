// Independent implementation, written without reference to reference.js.
export default (charges, target) => {
  // Binary search for a partner of each element, keeping the smallest first index.
  for (let i = 0; i < charges.length; i++) {
    const want = target - charges[i]
    let lo = i + 1
    let hi = charges.length - 1
    let found = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (charges[mid] === want) { found = mid; hi = mid - 1 }
      else if (charges[mid] < want) lo = mid + 1
      else hi = mid - 1
    }
    if (found !== -1) return [i, found]
  }
  return []
}
