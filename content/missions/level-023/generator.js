import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 30)
  const a = new Array(n)
  // At scale: every value even, target odd, so no pair exists and neither the
  // reference nor the naive solution can exit early.
  if (scale) { for (let i = 0; i < n; i++) a[i] = int(rng, 0, 1000000) * 2; return [a, 1] }
  for (let i = 0; i < n; i++) a[i] = int(rng, -30, 30)
  let target
  if (n >= 2 && rng() < 0.6) {
    const i = int(rng, 0, n - 2)
    const j = int(rng, i + 1, n - 1)
    target = a[i] + a[j]
  } else target = int(rng, -80, 80)
  return [a, target]
}
