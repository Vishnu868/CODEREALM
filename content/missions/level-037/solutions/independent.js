// Independent implementation, written without reference to reference.js.
export default (channels) => {
  const distinct = [...new Set(channels)]
  const countOf = (v) => channels.reduce((n, c) => (c === v ? n + 1 : n), 0)
  const pairs = distinct.map((v) => [v, countOf(v)])
  pairs.sort((p, q) => (q[1] - p[1]) || (p[0] - q[0]))
  return pairs.map((p) => p[0])
}
