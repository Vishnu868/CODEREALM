import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const rows = int(rng, 1, 5)
  const cols = int(rng, 1, 5)
  const grid = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) row.push(rng() < 0.4 ? 1 : 0)
    grid.push(row)
  }
  grid[0][0] = 0
  return [grid, int(rng, 0, 4)]
}
