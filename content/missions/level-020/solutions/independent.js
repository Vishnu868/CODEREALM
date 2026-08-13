// Independent implementation, written without reference to reference.js.
export default (readings) => {
  if (readings.length === 0) return 0
  const lengths = [1]
  for (let i = 1; i < readings.length; i++) {
    lengths.push(readings[i] > readings[i - 1] ? lengths[i - 1] + 1 : 1)
  }
  return Math.max(...lengths)
}
