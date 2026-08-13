// Reference solution. Correct and optimal. Never shown to the player.
export default (windows) => {
  const sorted = [...windows].sort((a, b) => a[1] - b[1])
  let approved = 0
  let lastEnd = -Infinity
  for (const [start, end] of sorted) {
    if (start >= lastEnd) { approved++; lastEnd = end }
  }
  return approved
}
