import { int, pick } from '../../lib/rand.js'
import { buildGraph, buildPath, buildDag, buildGrid } from '../../lib/graph.js'

export default (rng, scale) => {
  if (scale) return buildPath(scale + 1)   // scale counts EDGES, the sized argument
  const n = int(rng, 1, 12)
  return buildGraph(rng, n, int(rng, 0, 10))
}
