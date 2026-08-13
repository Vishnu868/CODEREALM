// Independent implementation, written without reference to reference.js.
export default (readings) => {
  // Same patience-style list, but located by a forward scan over a copy.
  const tails = []
  for (const v of readings) {
    let placed = false
    for (let i = 0; i < tails.length; i++) {
      if (tails[i] >= v) { tails[i] = v; placed = true; break }
    }
    if (!placed) tails.push(v)
  }
  return tails.length
}
