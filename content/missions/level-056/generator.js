import { int, pick } from '../../lib/rand.js'
import { buildTree, buildCompleteTree, buildBst } from '../../lib/tree.js'

export default (rng) => {
  const [tree] = buildBst(rng, int(rng, 0, 20))
  const present = tree.filter((v) => v !== null)
  const target = present.length > 0 && rng() < 0.6
    ? present[int(rng, 0, present.length - 1)]
    : int(rng, -70, 70)
  return [tree, target]
}
