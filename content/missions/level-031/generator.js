import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 30)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, 8)
  return [a, int(rng, 0, 10)]
}
