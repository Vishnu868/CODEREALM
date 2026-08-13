// Independent implementation, written without reference to reference.js.
export default (a, b) => [...a, ...b].sort((x, y) => x - y)
