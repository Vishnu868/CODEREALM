import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 30)
  const a = new Array(n)
  const span = Math.max(2, Math.floor(n / 3) + 1)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, span)
  return [a]
}
