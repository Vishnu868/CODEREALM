import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  if (rng() < 0.2) return [int(rng, 0, 2), int(rng, 0, 2)]
  return [int(rng, 0, 60), int(rng, 0, 60)]
}
