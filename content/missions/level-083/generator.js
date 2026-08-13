import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 30)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, scale ? 10000 : 20)
  return [a]
}
