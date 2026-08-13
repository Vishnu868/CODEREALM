import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = Math.max(1, scale ?? int(rng, 1, 25))
  const values = new Array(n)
  for (let i = 0; i < n; i++) values[i] = int(rng, -500, 500)
  const q = scale ? Math.max(1, Math.floor(n / 8)) : int(rng, 0, 20)
  const queries = new Array(q)
  for (let i = 0; i < q; i++) {
    // At scale, favour wide ranges so a per-query re-scan is genuinely costly.
    const l = scale ? 0 : int(rng, 0, n - 1)
    const r = scale ? n - 1 : int(rng, l, n - 1)
    queries[i] = [l, r]
  }
  return [values, queries]
}
