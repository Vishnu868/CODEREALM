// Reference solution. Correct and optimal. Never shown to the player.
export default (stream) => {
  if (stream.length === 0) return 0
  let best = 1
  let run = 1
  for (let i = 1; i < stream.length; i++) {
    run = stream[i] === stream[i - 1] ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}
