import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 10)
  const pool = []
  let v = int(rng, -5, 5)
  for (let i = 0; i < n; i++) { pool.push(v); v += int(rng, 1, 4) }
  return [pool]
}
