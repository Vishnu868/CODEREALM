// Independent implementation, written without reference to reference.js.
export default (readings) => {
  const idx = readings.findIndex((v, i) => i > 0 && v > readings[i - 1])
  return idx
}
