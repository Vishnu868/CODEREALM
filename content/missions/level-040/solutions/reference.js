// Reference solution. Correct and optimal. Never shown to the player.
export default (packets, cycles) => {
  const fits = (capacity) => {
    let used = 1
    let load = 0
    for (const p of packets) {
      if (load + p > capacity) { used++; load = 0 }
      load += p
    }
    return used <= cycles
  }
  let lo = Math.max(...packets)
  let hi = packets.reduce((a, b) => a + b, 0)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (fits(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}
