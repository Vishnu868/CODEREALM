import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 25)
  const m = scale ? Math.max(1, Math.floor(n / 2)) : int(rng, 0, 25)
  const span = Math.max(2, Math.floor(n / 2) + 1)
  const a = new Array(n)
  const b = new Array(m)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, span)
  for (let i = 0; i < m; i++) b[i] = int(rng, 0, span)
  return [a, b]
}
