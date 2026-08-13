import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // One long chain, edges listed in reverse so a relaxation sweep advances
    // by a single edge per pass.
    const edges = new Array(scale)
    for (let i = 0; i < scale; i++) edges[i] = [scale - 1 - i, scale - i]
    return [scale + 1, edges]
  }
  const n = int(rng, 1, 10)
  const edges = []
  const seen = new Set()
  const count = int(rng, 0, 12)
  for (let i = 0; i < count && n > 1; i++) {
    const u = int(rng, 0, n - 2)
    const v = int(rng, u + 1, n - 1)
    const key = u + ':' + v
    if (seen.has(key)) continue
    seen.add(key)
    edges.push([u, v])
  }
  return [n, edges]
}
