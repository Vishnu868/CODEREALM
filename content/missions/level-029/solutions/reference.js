// Reference solution. Correct and optimal. Never shown to the player.
export default (n, pulses) => {
  const delta = new Array(n + 1).fill(0)
  for (const [l, r, v] of pulses) {
    delta[l] += v
    delta[r + 1] -= v
  }
  const out = new Array(n)
  let running = 0
  for (let i = 0; i < n; i++) {
    running += delta[i]
    out[i] = running
  }
  return out
}
