// Independent implementation, written without reference to reference.js.
export default (readings) => {
  // Prefix-sum view: best stretch ending at i is prefix[i+1] minus the smallest
  // earlier prefix.
  let best = -Infinity
  let running = 0
  let smallestPrefix = 0
  for (let i = 0; i < readings.length; i++) {
    running += readings[i]
    if (running - smallestPrefix > best) best = running - smallestPrefix
    if (running < smallestPrefix) smallestPrefix = running
  }
  return best
}
