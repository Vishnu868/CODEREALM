import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 8)
  const pool = []
  let v = int(rng, -5, 5)
  for (let i = 0; i < n; i++) { pool.push(v); v += int(rng, 1, 4) }
  const k = rng() < 0.25 ? int(rng, -2, n + 2) : int(rng, 0, n)
  return [pool, k]
}
