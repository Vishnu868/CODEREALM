import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 40)
  const a = new Array(n)
  // Mostly unique, so the answer is not trivially true every time.
  const unique = rng() < 0.5
  for (let i = 0; i < n; i++) a[i] = unique ? i : int(rng, 0, Math.max(1, Math.floor(n * 0.9)))
  return [a]
}
