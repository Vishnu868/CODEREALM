// Reference solution. Correct and optimal. Never shown to the player.
export default (windows) => {
  const starts = windows.map((w) => w[0]).sort((a, b) => a - b)
  const ends = windows.map((w) => w[1]).sort((a, b) => a - b)
  let open = 0
  let best = 0
  let i = 0
  let j = 0
  while (i < starts.length) {
    if (starts[i] < ends[j]) { open++; i++; if (open > best) best = open }
    else { open--; j++ }
  }
  return best
}
