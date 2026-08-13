import { int, pick } from '../../lib/rand.js'
import { buildGraph, buildPath, buildDag, buildGrid } from '../../lib/graph.js'

export default (rng, scale) => {
  // The sized argument is the grid, so its row count must equal scale exactly.
  if (scale) {
    // A single serpentine corridor: one region, but a label has to travel its
    // whole length, which is the worst case for repeated-sweep approaches.
    const grid = new Array(scale)
    for (let r = 0; r < scale; r++) {
      if (r % 2 === 0) grid[r] = [0, 0, 0]
      else grid[r] = (r % 4 === 1) ? [1, 1, 0] : [0, 1, 1]
    }
    return [grid]
  }
  const rows = int(rng, 1, 6)
  const cols = int(rng, 1, 6)
  return buildGrid(rng, rows, cols, 0.4)
}
