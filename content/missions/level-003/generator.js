import { int } from '../../lib/rand.js'

// Hidden-test generator. gen(rng) for correctness cases; gen(rng, scale) must
// honour the requested input size exactly for performance cases.
export default (rng) => [rng() < 0.2 ? int(rng, -100, 1) : int(rng, 1, 5000)]
