import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // Wide pulses over a large line: the naive per-cell loop is worst case here.
    const n = 200000
    const pulses = new Array(scale)
    for (let i = 0; i < scale; i++) pulses[i] = [0, n - 1, 1]
    return [n, pulses]
  }
  const n = int(rng, 1, 20)
  const p = int(rng, 0, 12)
  const pulses = new Array(p)
  for (let i = 0; i < p; i++) {
    const l = int(rng, 0, n - 1)
    const r = int(rng, l, n - 1)
    pulses[i] = [l, r, int(rng, -20, 20)]
  }
  return [n, pulses]
}
