import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 1, 25)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, 1, 30)
  return [a, int(rng, 1, n)]
}
