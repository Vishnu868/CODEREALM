import { int } from '../../lib/rand.js'
import { buildTree } from '../../lib/tree.js'

/**
 * The format guarantees nothing exists beneath a null. An earlier version of
 * this generator could turn a null into a value, producing a node with no
 * parent — an input the format forbids, on which two correct solutions
 * legitimately disagree. Perturbations now only ever touch existing nodes.
 */
export default (rng) => {
  const [a] = buildTree(rng, int(rng, 0, 15))

  if (rng() < 0.5) {
    const b = a.slice()
    const present = []
    for (let i = 0; i < b.length; i++) if (b[i] !== null) present.push(i)

    if (present.length > 0 && rng() < 0.6) {
      const i = present[int(rng, 0, present.length - 1)]
      if (rng() < 0.5) {
        b[i] = b[i] + 1                       // same shape, different value
      } else {
        // Remove this node and everything beneath it, keeping the tree valid.
        for (let j = i; j < b.length; j++) {
          let p = j
          while (p > i) p = Math.floor((p - 1) / 2)
          if (p === i) b[j] = null
        }
      }
    }
    while (b.length > 0 && b[b.length - 1] === null) b.pop()
    return [a, b]
  }

  const [b] = buildTree(rng, int(rng, 0, 15))
  return [a, b]
}
