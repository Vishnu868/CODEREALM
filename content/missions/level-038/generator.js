import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 25)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, -50, 50)
  // At scale, k sits near the end so a repeated-extraction approach does maximum work.
  const k = scale ? n : (rng() < 0.2 ? int(rng, -3, 0) : int(rng, 1, Math.max(1, n + 2)))
  return [a, k]
}
