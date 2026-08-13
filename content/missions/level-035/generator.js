import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 25)
  const base = new Array(n)
  let v = int(rng, 0, 5)
  for (let i = 0; i < n; i++) { base[i] = v; v += int(rng, 1, 4) }
  const k = n > 0 ? int(rng, 0, n - 1) : 0
  const rotated = base.slice(k).concat(base.slice(0, k))
  const target = n > 0 && rng() < 0.7 ? rotated[int(rng, 0, n - 1)] : int(rng, 0, v + 2)
  return [rotated, target]
}
