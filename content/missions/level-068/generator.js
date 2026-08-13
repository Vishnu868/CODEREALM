import { int, pick } from '../../lib/rand.js'
import { buildGraph, buildPath, buildDag, buildGrid } from '../../lib/graph.js'

export default (rng) => {
  const n = int(rng, 1, 10)
  const [, edges] = buildDag(rng, n, int(rng, 0, 12))
  return [n, edges]
}
