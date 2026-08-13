import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const rows = int(rng, 1, 6)
  const cols = int(rng, 1, 6)
  const grid = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) row.push(rng() < 0.3 ? 1 : 0)
    grid.push(row)
  }
  return [grid]
}
