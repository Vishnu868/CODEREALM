import { int } from './rand.js'

/**
 * Shared linked-list builder for the level 43–46 chain missions.
 *
 * FORMAT DECISION (fixed here, once): a chain is `nodes`, an array of
 * [value, next] pairs, plus a `head` index. `next` is -1 at the end. Node
 * positions in the array are deliberately shuffled, so a solution that walks the
 * array left-to-right instead of following links will fail.
 *
 * This is passed as plain arrays rather than a bespoke encoding, so it is
 * identical in JavaScript and Python and needs no serialisation glue.
 */
export function buildChain(rng, n, withLoop) {
  if (n === 0) return [[], -1]

  // A shuffled order of slots, so array position never matches chain position.
  const slots = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = int(rng, 0, i)
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }

  const nodes = new Array(n)
  for (let i = 0; i < n; i++) {
    const slot = slots[i]
    const next = i + 1 < n ? slots[i + 1] : -1
    nodes[slot] = [int(rng, -1000, 1000), next]
  }

  if (withLoop && n > 1) {
    // Point the tail back into the chain to create a cycle.
    nodes[slots[n - 1]][1] = slots[int(rng, 0, n - 1)]
  }

  return [nodes, slots[0]]
}
