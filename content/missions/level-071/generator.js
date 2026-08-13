import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 30)
  const out = new Array(n)
  for (let i = 0; i < n; i++) {
    const s = int(rng, 0, scale ? 1000000 : 40)
    out[i] = [s, s + int(rng, 1, scale ? 50 : 8)]
  }
  return [out]
}
