import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 1, 5)
  const sizes = []
  let v = int(rng, 1, 6)
  for (let i = 0; i < n; i++) { sizes.push(v); v += int(rng, 1, 6) }
  return [sizes, int(rng, 0, 60)]
}
