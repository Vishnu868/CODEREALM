import { int, pick } from '../../lib/rand.js'

export default (rng) => [int(rng, -3, 3), int(rng, 0, 30)]
