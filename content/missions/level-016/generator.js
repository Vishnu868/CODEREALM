import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 40)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, -100, 100)
  // At scale, k is a FIXED 1000 rather than a fraction of n. Scaling k with n
  // makes the naive O(n*k) solution look quadratic at every sample size, and the
  // projection then cannot separate it from the reference. A fixed k keeps the
  // naive cost honestly linear in n with a large constant, which is what it is.
  const k = scale ? 1000 : (rng() < 0.2 ? int(rng, -5, 0) : int(rng, 1, Math.max(1, n + 2)))
  return [a, k]
}
