import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 12)
  const masses = new Array(n)
  const values = new Array(n)
  for (let i = 0; i < n; i++) { masses[i] = int(rng, 1, 20); values[i] = int(rng, 0, 60) }
  return [masses, values, int(rng, 0, 60)]
}
