import { int } from '../../lib/rand.js'

// Hidden-test generator. gen(rng) for correctness cases; gen(rng, scale) must
// honour the requested input size exactly for performance cases.
export default (rng, scale) => {
  const n = scale ?? int(rng, 1, 60)
  const span = Math.max(2, Math.floor(n / 4))
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, span)
  return [a]
}
