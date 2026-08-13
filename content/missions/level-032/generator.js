import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 20)
  const table = new Array(n)
  let v = int(rng, 0, 5)
  for (let i = 0; i < n; i++) { table[i] = v; v += int(rng, 1, 4) }
  // At scale, every target is absent, so a linear scan cannot exit early.
  const q = scale ? Math.max(1, Math.floor(n / 10)) : int(rng, 0, 12)
  const targets = new Array(q)
  for (let i = 0; i < q; i++) targets[i] = scale ? -1 : int(rng, 0, v + 2)
  return [table, targets]
}
