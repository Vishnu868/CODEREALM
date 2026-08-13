// Independent implementation, written without reference to reference.js.
export default (packet) => {
  const first = new Map()
  const repeated = new Set()
  for (let i = 0; i < packet.length; i++) {
    const ch = packet[i]
    if (first.has(ch)) repeated.add(ch)
    else first.set(ch, i)
  }
  let best = -1
  for (const [ch, idx] of first) {
    if (!repeated.has(ch) && (best === -1 || idx < best)) best = idx
  }
  return best
}
