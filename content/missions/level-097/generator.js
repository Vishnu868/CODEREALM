import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 7)
  const costs = []
  for (let i = 0; i < n; i++) {
    const row = []
    for (let j = 0; j < n; j++) row.push(int(rng, 0, 40))
    costs.push(row)
  }
  return [costs]
}
