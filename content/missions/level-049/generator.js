import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // Strictly decreasing: nothing ever finds a greater value, so the naive
    // rightward scan runs to the end from every position.
    const a = new Array(scale)
    for (let i = 0; i < scale; i++) a[i] = scale - i
    return [a]
  }
  const n = int(rng, 0, 30)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, -10, 10)
  return [a]
}
