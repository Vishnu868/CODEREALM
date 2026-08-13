import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // Increasing heights: nothing pops until the very end, and the naive
    // pairwise scan does maximum work.
    const a = new Array(scale)
    for (let i = 0; i < scale; i++) a[i] = i + 1
    return [a]
  }
  const n = int(rng, 0, 25)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, 0, 12)
  return [a]
}
