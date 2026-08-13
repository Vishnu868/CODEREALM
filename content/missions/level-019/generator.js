import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 40)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = rng() < 0.3 ? pick(rng, [-1, 0, 1]) : int(rng, -1000, 1000)
  return [a]
}
