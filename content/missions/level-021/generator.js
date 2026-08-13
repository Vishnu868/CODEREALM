import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 25)
  const span = Math.max(2, Math.floor(n / 2) + 1)
  const updates = new Array(n)
  for (let i = 0; i < n; i++) updates[i] = [int(rng, 0, span), int(rng, -500, 500)]
  const q = scale ? Math.max(1, Math.floor(n / 4)) : int(rng, 0, 25)
  const queries = new Array(q)
  for (let i = 0; i < q; i++) queries[i] = int(rng, 0, span + 2)
  return [updates, queries]
}
