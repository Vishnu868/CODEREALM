import { int, pick } from '../../lib/rand.js'

export default (rng) => [rng() < 0.15 ? pick(rng, [1, 2, 3]) : int(rng, 1, 100000)]
