import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const n = int(rng, 0, 40)
  const a = new Array(n)
  if (rng() < 0.3) {
    let v = int(rng, 0, 50)
    for (let i = 0; i < n; i++) { a[i] = v; v -= int(rng, 0, 3) }
  } else {
    for (let i = 0; i < n; i++) a[i] = int(rng, -20, 20)
  }
  return [a]
}
