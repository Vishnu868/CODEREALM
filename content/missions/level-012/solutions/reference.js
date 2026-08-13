// Reference solution. Correct and optimal. Never shown to the player.
export default (signal) => {
  const out = new Array(signal.length)
  for (let i = 0; i < signal.length; i++) out[i] = signal[signal.length - 1 - i]
  return out
}
