import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = Math.max(1, scale ?? int(rng, 1, 30))
  const a = new Array(n)
  const allNeg = !scale && rng() < 0.25
  for (let i = 0; i < n; i++) a[i] = allNeg ? int(rng, -50, -1) : int(rng, -20, 20)
  return [a]
}
