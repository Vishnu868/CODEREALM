// Independent implementation, written without reference to reference.js.
export default (packets, cycles) => {
  // Walk capacities upward from the largest packet until one works.
  const cyclesNeeded = (capacity) => {
    let used = 1
    let load = 0
    for (const p of packets) {
      if (load + p > capacity) { used++; load = 0 }
      load += p
    }
    return used
  }
  let capacity = Math.max(...packets)
  while (cyclesNeeded(capacity) > cycles) capacity++
  return capacity
}
