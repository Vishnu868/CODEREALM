import { int, pick } from '../../lib/rand.js'
import { buildGraph, buildPath, buildDag, buildGrid } from '../../lib/graph.js'

export default (rng, scale) => {
  // At scale, a long path: every node is a different distance from the start,
  // which is the worst case for repeated-relaxation approaches.
  if (scale) return buildPath(scale + 1)   // scale counts EDGES, the sized argument
  const n = int(rng, 1, 12)
  return buildGraph(rng, n, int(rng, 0, 14))
}
