import { int } from '../../lib/rand.js'

// Hidden-test generator. gen(rng) for correctness cases; gen(rng, scale) must
// honour the requested input size exactly for performance cases.
export default (rng) => {
  const edges = [19, 20, 21, 79, 80, 81, 0, -1000, 1000]
  return rng() < 0.5 ? [edges[int(rng, 0, edges.length - 1)]] : [int(rng, -1000, 1000)]
}
