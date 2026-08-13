import { int, pick } from '../../lib/rand.js'
import { buildGraph, buildPath, buildDag, buildGrid } from '../../lib/graph.js'

export default (rng) => {
  const n = int(rng, 1, 12)
  return buildGraph(rng, n, int(rng, 0, 14))
}
