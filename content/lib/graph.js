import { int } from './rand.js'

/**
 * Shared graph builder for the level 61–70 missions.
 *
 * FORMAT DECISION (fixed here, once): a graph is passed as `n`, the number of
 * nodes (always numbered 0 to n-1), plus `edges`, an array of [u, v] pairs — or
 * [u, v, weight] where weights matter. Nothing is nested and nothing is
 * implicit, so the same arguments work unchanged in JavaScript and Python, and
 * the player builds whatever representation they prefer.
 *
 * Never a pre-built adjacency list: the order of neighbours inside one would be
 * an invisible part of the input that different correct solutions could depend
 * on differently.
 */

/** A random undirected graph with no self-loops and no duplicate edges. */
export function buildGraph(rng, n, edgeCount, weighted) {
  const seen = new Set()
  const edges = []
  let attempts = 0
  while (edges.length < edgeCount && attempts < edgeCount * 20) {
    attempts++
    const u = int(rng, 0, n - 1)
    const v = int(rng, 0, n - 1)
    if (u === v) continue
    const key = u < v ? `${u}:${v}` : `${v}:${u}`
    if (seen.has(key)) continue
    seen.add(key)
    edges.push(weighted ? [u, v, int(rng, 1, 20)] : [u, v])
  }
  return [n, edges]
}

/**
 * A single path 0-1-2-...-(n-1), with the edge list in REVERSE order.
 *
 * The order matters more than the shape. Listed front to back, a repeated
 * relaxation sweep propagates the whole way in one pass and finishes in linear
 * time — the gate then proves nothing. Listed back to front, each sweep advances
 * the frontier by one edge, which is the genuine worst case.
 */
export function buildPath(n, weighted) {
  const edges = []
  for (let i = n - 2; i >= 0; i--) edges.push(weighted ? [i, i + 1, 1] : [i, i + 1])
  return [n, edges]
}

/** A directed acyclic graph: every edge points from a lower index to a higher one. */
export function buildDag(rng, n, edgeCount) {
  if (n < 2) return [n, []]   // no edge can point from a lower index to a higher one
  const seen = new Set()
  const edges = []
  let attempts = 0
  while (edges.length < edgeCount && attempts < edgeCount * 20) {
    attempts++
    const u = int(rng, 0, n - 2)
    const v = int(rng, u + 1, n - 1)
    const key = `${u}:${v}`
    if (seen.has(key)) continue
    seen.add(key)
    edges.push([u, v])
  }
  return [n, edges]
}

/** A grid of 0 (open) and 1 (blocked), as an array of arrays. */
export function buildGrid(rng, rows, cols, blockedChance) {
  const grid = new Array(rows)
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols)
    for (let c = 0; c < cols; c++) grid[r][c] = rng() < blockedChance ? 1 : 0
  }
  return [grid]
}
