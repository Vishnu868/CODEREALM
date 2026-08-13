// Independent implementation, written without reference to reference.js.
export default (stream) => {
  const runs = stream.match(/(.)\1*/g)
  return runs ? Math.max(...runs.map((r) => r.length)) : 0
}
