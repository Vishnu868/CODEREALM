// Reference solution. Correct and optimal. Never shown to the player.
export default (channels) => {
  let lo = 0
  let hi = channels.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (channels[mid] > channels[hi]) lo = mid + 1
    else hi = mid
  }
  return channels[lo]
}
