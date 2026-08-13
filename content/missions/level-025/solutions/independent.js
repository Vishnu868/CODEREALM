// Independent implementation, written without reference to reference.js.
export default (readings, target) => {
  // Same identity, but accumulating the prefix array first.
  const prefix = [0]
  for (let i = 0; i < readings.length; i++) prefix.push(prefix[i] + readings[i])
  const seen = new Map()
  let found = 0
  for (let i = 0; i < prefix.length; i++) {
    if (i > 0) found += seen.get(prefix[i] - target) || 0
    seen.set(prefix[i], (seen.get(prefix[i]) || 0) + 1)
  }
  return found
}
