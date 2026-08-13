import { int, pick } from '../../lib/rand.js'
import { buildTree, buildCompleteTree, buildBst } from '../../lib/tree.js'

export default (rng) => {
  const [tree] = buildBst(rng, int(rng, 1, 20))
  const present = tree.filter((v) => v !== null)
  return [tree, present[int(rng, 0, present.length - 1)], present[int(rng, 0, present.length - 1)]]
}
