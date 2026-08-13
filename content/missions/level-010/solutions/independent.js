// Independent implementation, written without reference to reference.js.
export default (readings) => {
  const inBand = readings.filter((r) => r >= 20 && r <= 80)
  if (inBand.length === 0) return -1
  return inBand.reduce((a, b) => a + b, 0)
}
