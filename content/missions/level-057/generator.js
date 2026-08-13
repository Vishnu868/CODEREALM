import { int, pick } from '../../lib/rand.js'
import { buildTree, buildCompleteTree, buildBst } from '../../lib/tree.js'

export default (rng) => {
  if (rng() < 0.5) return buildBst(rng, int(rng, 0, 15))
  const [tree] = buildTree(rng, int(rng, 1, 15))
  return [tree]
}
