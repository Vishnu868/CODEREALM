// Independent implementation, written without reference to reference.js.
export default (jobs) => {
  // Each job contributes its duration once for itself and once per job after it.
  const sorted = [...jobs].sort((a, b) => a - b)
  let total = 0
  for (let i = 0; i < sorted.length; i++) total += sorted[i] * (sorted.length - i)
  return total
}
