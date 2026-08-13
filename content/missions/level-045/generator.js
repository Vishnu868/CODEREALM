import { int, pick } from '../../lib/rand.js'

import { buildChain } from '../../lib/chain.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 30)
  return buildChain(rng, n, false)
}
