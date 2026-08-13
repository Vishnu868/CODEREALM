import { int, pick } from '../../lib/rand.js'

export default (rng) => [rng() < 0.2 ? int(rng, 0, 3) : int(rng, 0, 45)]
