import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 50)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, -200, 200)
  return [a, int(rng, -200, 200)]
}
