import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const edges = [-1, 0, 50, 51, 90, 91, -1000, 1000]
  const load = rng() < 0.55 ? pick(rng, edges) : int(rng, -1000, 1000)
  return [load, rng() < 0.5]
}
