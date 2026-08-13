// Independent implementation, written without reference to reference.js.
export default (log, target) => {
  const first = log.indexOf(target)
  const last = log.lastIndexOf(target)
  return [first, last]
}
