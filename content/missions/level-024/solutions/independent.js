// Independent implementation, written without reference to reference.js.
export default (values, queries) => {
  // Same idea, accumulated in place rather than into a separate array.
  const running = values.slice()
  for (let i = 1; i < running.length; i++) running[i] += running[i - 1]
  const out = []
  for (const [l, r] of queries) out.push(running[r] - (l > 0 ? running[l - 1] : 0))
  return out
}
