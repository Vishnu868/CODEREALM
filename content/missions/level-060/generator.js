import { int } from '../../lib/rand.js'
import { buildTree } from '../../lib/tree.js'

export default (rng) => buildTree(rng, int(rng, 0, 18))
