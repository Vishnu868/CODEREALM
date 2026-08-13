import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // A connected chain plus extra links, so the search cannot stop early.
    const n = Math.floor(scale / 2) + 1
    const links = new Array(scale)
    for (let i = 0; i < scale; i++) {
      if (i < n - 1) links[i] = [i, i + 1, int(rng, 1, 100000)]
      else links[i] = [int(rng, 0, n - 1), int(rng, 0, n - 1), int(rng, 1, 100000)]
    }
    return [n, links]
  }
  const n = int(rng, 1, 8)
  const links = []
  const count = int(rng, 0, 12)
  for (let i = 0; i < count && n > 1; i++) {
    const u = int(rng, 0, n - 1)
    const v = int(rng, 0, n - 1)
    if (u === v) continue
    links.push([u, v, int(rng, 1, 30)])
  }
  return [n, links]
}
