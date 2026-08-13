import { int, pick } from '../../lib/rand.js'
import { buildTree, buildCompleteTree, buildBst } from '../../lib/tree.js'

export default (rng) => buildTree(rng, int(rng, 0, 15))
