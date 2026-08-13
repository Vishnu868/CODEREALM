// Reference solution. Correct and optimal. Never shown to the player.
export default (log, target) => {
  const bound = (wantFirst) => {
    let lo = 0
    let hi = log.length - 1
    let found = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (log[mid] === target) {
        found = mid
        if (wantFirst) hi = mid - 1
        else lo = mid + 1
      } else if (log[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    return found
  }
  return [bound(true), bound(false)]
}
