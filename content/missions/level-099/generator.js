import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // Every value distinct with a large k: the window never shrinks, so a
    // rescan from every start position does maximum work.
    const a = new Array(scale)
    for (let i = 0; i < scale; i++) a[i] = i
    return [a, scale]
  }
  const n = int(rng, 0, 30)
  const a = new Array(n)
  const span = Math.max(1, Math.floor(n / 3) + 1)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, span)
  return [a, int(rng, 0, 4)]
}
