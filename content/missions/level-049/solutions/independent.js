// Independent implementation, written without reference to reference.js.
export default (readings) => {
  // Sweep right to left, discarding values that can never be an answer.
  const out = new Array(readings.length).fill(-1)
  const candidates = []
  for (let i = readings.length - 1; i >= 0; i--) {
    while (candidates.length > 0 && candidates[candidates.length - 1] <= readings[i]) candidates.pop()
    if (candidates.length > 0) out[i] = candidates[candidates.length - 1]
    candidates.push(readings[i])
  }
  return out
}
