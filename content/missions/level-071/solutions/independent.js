// Independent implementation, written without reference to reference.js.
export default (windows) => {
  // Sweep events in time order, tracking the best count achievable so far.
  const sorted = [...windows].sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]))
  const chosen = []
  for (const w of sorted) {
    if (chosen.length === 0 || w[0] >= chosen[chosen.length - 1][1]) chosen.push(w)
  }
  return chosen.length
}
