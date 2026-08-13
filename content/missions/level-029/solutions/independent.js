// Independent implementation, written without reference to reference.js.
export default (n, pulses) => {
  // Same difference trick, accumulated in place.
  const cells = new Array(n + 1).fill(0)
  for (let i = 0; i < pulses.length; i++) {
    cells[pulses[i][0]] += pulses[i][2]
    cells[pulses[i][1] + 1] -= pulses[i][2]
  }
  for (let i = 1; i < n; i++) cells[i] += cells[i - 1]
  cells.length = n
  return cells
}
