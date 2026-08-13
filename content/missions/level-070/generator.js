import { int, pick } from '../../lib/rand.js'
import { buildGraph, buildPath, buildDag, buildGrid } from '../../lib/graph.js'

export default (rng, scale) => {
  if (scale) {
    // Serpentine corridor again: the only route is the full length of the grid,
    // so a repeated-relaxation approach advances one cell per sweep.
    const grid = new Array(scale)
    for (let r = 0; r < scale; r++) {
      if (r % 2 === 0) grid[r] = [0, 0, 0]
      else grid[r] = (r % 4 === 1) ? [1, 1, 0] : [0, 1, 1]
    }
    // The destination corner MUST be open. With it blocked, every solution
    // returns -1 on the first line and the timing measures nothing at all.
    grid[scale - 1] = [0, 0, 0]
    return [grid]
  }
  const rows = int(rng, 1, 6)
  const cols = int(rng, 1, 6)
  return buildGrid(rng, rows, cols, 0.35)
}
