import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 1, 9)
  const cells = new Array(n)
  for (let i = 0; i < n; i++) cells[i] = int(rng, 1, 8)
  return [cells, int(rng, 1, 4)]
}
