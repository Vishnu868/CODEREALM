import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 40)
  const a = new Array(n)
  let v = int(rng, -50, 0)
  for (let i = 0; i < n; i++) { a[i] = v; v += int(rng, 1, 4) }   // strictly increasing

  // At scale, use a worst case: every value is even, so an odd target has no
  // pair and the search cannot exit early. A generator that lets the naive
  // solution return on its first probe measures nothing.
  if (scale) {
    for (let i = 0; i < n; i++) a[i] *= 2
    return [a, 1]
  }

  let target
  if (n >= 2 && rng() < 0.6) {
    const i = int(rng, 0, n - 2)
    const j = int(rng, i + 1, n - 1)
    target = a[i] + a[j]
  } else {
    target = int(rng, -200, 400)
  }
  return [a, target]
}
