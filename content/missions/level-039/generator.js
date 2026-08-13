import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 1, 25)
  const base = new Array(n)
  let v = int(rng, -20, 20)
  for (let i = 0; i < n; i++) { base[i] = v; v += int(rng, 1, 4) }
  const k = int(rng, 0, n - 1)
  return [base.slice(k).concat(base.slice(0, k))]
}
