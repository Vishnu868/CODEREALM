import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 25)
  const out = new Array(n)
  // At scale, every deadline is large, so a backward scan for a free cycle
  // covers a long stretch each time.
  const span = scale ? n : int(rng, 1, 8)
  for (let i = 0; i < n; i++) out[i] = [scale ? span : int(rng, 1, span), int(rng, 1, scale ? 10000 : 50)]
  return [out]
}
