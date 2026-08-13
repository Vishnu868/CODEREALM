import { int } from './rand.js'

/**
 * Shared tree builder for the level 51–60 missions.
 *
 * FORMAT DECISION (fixed here, once): a binary tree is a single array where the
 * node at index i has its left child at 2i+1 and its right child at 2i+2. A null
 * entry means no node, and the entire subtree beneath a null is also absent.
 * An empty array is an empty tree.
 *
 * Why this and not a nested object or a bespoke encoding: child positions are
 * pure arithmetic, so there is nothing to parse and nothing to serialise. The
 * exact same array works unchanged in JavaScript and Python.
 */

/** A tree of `n` nodes with a random shape, values in [-50, 50]. */
export function buildTree(rng, n, valueOf) {
  if (n === 0) return [[]]   // one argument, an empty tree — not zero arguments
  const nodes = new Map([[0, pickValue(rng, valueOf, 0)]])
  const openSlots = [1, 2]
  for (let placed = 1; placed < n; placed++) {
    const choice = int(rng, 0, openSlots.length - 1)
    const slot = openSlots.splice(choice, 1)[0]
    nodes.set(slot, pickValue(rng, valueOf, placed))
    openSlots.push(2 * slot + 1, 2 * slot + 2)
  }
  return [toArray(nodes)]
}

/** A near-complete tree — the shape to use for large performance cases. */
export function buildCompleteTree(n, valueOf) {
  const out = new Array(n)
  for (let i = 0; i < n; i++) out[i] = valueOf ? valueOf(i) : i
  return [out]
}

/** A valid binary search tree of `n` distinct values. */
export function buildBst(rng, n) {
  if (n === 0) return [[]]   // one argument, an empty tree — not zero arguments
  const values = []
  let v = int(rng, -60, -30)
  for (let i = 0; i < n; i++) { values.push(v); v += int(rng, 1, 5) }
  shuffle(rng, values)

  // Insertion indices double with depth, so an unlucky order can produce an
  // enormous sparse array. Reshuffle until the tree is reasonably balanced.
  for (let attempt = 0; attempt < 40; attempt++) {
    const nodes = new Map()
    let deepest = 0
    for (const value of values) {
      let i = 0
      while (nodes.has(i)) i = value < nodes.get(i) ? 2 * i + 1 : 2 * i + 2
      nodes.set(i, value)
      if (i > deepest) deepest = i
    }
    if (deepest < 20000) return [toArray(nodes)]
    shuffle(rng, values)
  }
  // Fall back to a balanced build from the sorted values.
  values.sort((a, b) => a - b)
  const nodes = new Map()
  const place = (lo, hi, i) => {
    if (lo > hi) return
    const mid = (lo + hi) >> 1
    nodes.set(i, values[mid])
    place(lo, mid - 1, 2 * i + 1)
    place(mid + 1, hi, 2 * i + 2)
  }
  place(0, values.length - 1, 0)
  return [toArray(nodes)]
}

function pickValue(rng, valueOf, index) {
  return valueOf ? valueOf(index) : int(rng, -50, 50)
}

function toArray(nodes) {
  const size = Math.max(...nodes.keys()) + 1
  const out = new Array(size).fill(null)
  for (const [i, v] of nodes) out[i] = v
  return out
}

function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = int(rng, 0, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}
