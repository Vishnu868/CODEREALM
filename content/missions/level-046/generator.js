import { int, pick } from '../../lib/rand.js'

import { buildChain } from '../../lib/chain.js'

export default (rng, scale) => {
  // At scale, no loop: the walk runs the full length and nothing exits early.
  if (scale) return buildChain(rng, scale, false)
  const n = int(rng, 0, 30)
  return buildChain(rng, n, n > 1 && rng() < 0.5)
}
