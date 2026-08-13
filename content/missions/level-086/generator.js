import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 30)
  const a = new Array(n)
  // At scale, a long rising run so the quadratic scan does maximum work.
  if (scale) { for (let i = 0; i < n; i++) a[i] = i; return [a] }
  for (let i = 0; i < n; i++) a[i] = int(rng, -20, 20)
  return [a]
}
