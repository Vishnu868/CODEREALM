// Reference solution. Correct and optimal. Never shown to the player.
export default (channels, target) => {
  let lo = 0
  let hi = channels.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (channels[mid] === target) return mid
    if (channels[lo] <= channels[mid]) {
      if (channels[lo] <= target && target < channels[mid]) hi = mid - 1
      else lo = mid + 1
    } else {
      if (channels[mid] < target && target <= channels[hi]) lo = mid + 1
      else hi = mid - 1
    }
  }
  return -1
}
