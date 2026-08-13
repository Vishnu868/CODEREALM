// Independent implementation, written without reference to reference.js.
export default (log) => log.filter((v) => v > 0).reduce((a, b) => a + b, 0)
