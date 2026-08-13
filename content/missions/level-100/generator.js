import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // The sized argument is `activation` — the first array — so it must hold
    // exactly `scale` entries, and the link count follows from it.
    const n = scale
    const activation = new Array(n)
    for (let i = 0; i < n; i++) activation[i] = int(rng, 1, 1000000)
    const linkCount = n - 1
    const links = new Array(linkCount)
    for (let i = 0; i < linkCount; i++) links[i] = [i, i + 1, int(rng, 1, 1000000)]
    return [n, activation, links]
  }
  const n = int(rng, 1, 8)
  const activation = new Array(n)
  for (let i = 0; i < n; i++) activation[i] = int(rng, 1, 30)
  const links = []
  const count = int(rng, 0, 12)
  for (let i = 0; i < count && n > 1; i++) {
    const u = int(rng, 0, n - 1)
    const v = int(rng, 0, n - 1)
    if (u === v) continue
    links.push([u, v, int(rng, 1, 30)])
  }
  return [n, activation, links]
}
