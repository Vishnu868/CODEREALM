import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 25)
  const a = new Array(n)
  let v = int(rng, 0, 4)
  for (let i = 0; i < n; i++) { a[i] = v; v += int(rng, 0, 3) }
  const target = n > 0 && rng() < 0.5 ? a[int(rng, 0, n - 1)] : int(rng, -2, v + 3)
  return [a, target]
}
