import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const letters = 'abc'
  const rows = int(rng, 1, 4)
  const cols = int(rng, 1, 4)
  const grid = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) row.push(pick(rng, letters.split('')))
    grid.push(row)
  }
  // Half the time trace a real path so true answers are well represented.
  if (rng() < 0.5) {
    let r = int(rng, 0, rows - 1)
    let c = int(rng, 0, cols - 1)
    const used = new Set([r + ':' + c])
    let word = grid[r][c]
    const steps = int(rng, 0, 5)
    for (let s = 0; s < steps; s++) {
      const options = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
        .filter(([y, x]) => y >= 0 && x >= 0 && y < rows && x < cols && !used.has(y + ':' + x))
      if (options.length === 0) break
      const [ny, nx] = options[int(rng, 0, options.length - 1)]
      used.add(ny + ':' + nx)
      word += grid[ny][nx]
      r = ny
      c = nx
    }
    return [grid, word]
  }
  let word = ''
  const len = int(rng, 0, 5)
  for (let i = 0; i < len; i++) word += pick(rng, letters.split(''))
  return [grid, word]
}
