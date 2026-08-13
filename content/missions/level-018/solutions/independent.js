// Independent implementation, written without reference to reference.js.
export default (stream) => {
  if (stream.length === 0) return ''
  const chars = [...new Set(stream)].sort()
  let best = chars[0]
  for (const ch of chars) {
    const a = stream.split(ch).length - 1
    const b = stream.split(best).length - 1
    if (a > b) best = ch
  }
  return best
}
