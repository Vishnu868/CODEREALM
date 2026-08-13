import { int } from '../../lib/rand.js'

// Hidden-test generator. gen(rng) for correctness cases; gen(rng, scale) must
// honour the requested input size exactly for performance cases.
export default (rng) => [int(rng, 0, 40)]
