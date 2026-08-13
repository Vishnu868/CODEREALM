import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 1, 25)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, 1, scale ? 10000 : 20)
  return [a, scale ? Math.max(1, Math.floor(n / 3)) : int(rng, 1, n)]
}
