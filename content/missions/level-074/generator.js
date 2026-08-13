import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 6)
  const pool = []
  let v = int(rng, -5, 5)
  for (let i = 0; i < n; i++) { pool.push(v); v += int(rng, 1, 4) }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = int(rng, 0, i)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return [pool]
}
