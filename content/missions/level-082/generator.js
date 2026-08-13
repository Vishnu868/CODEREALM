import { int, pick } from '../../lib/rand.js'

export default (rng) => [int(rng, 1, 12), int(rng, 1, 12)]
