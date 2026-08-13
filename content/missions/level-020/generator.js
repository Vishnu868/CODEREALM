import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 40)
  const a = new Array(n)
  // At scale, one long climb: a naive re-scan from every start is then worst case.
  if (scale) { for (let i = 0; i < n; i++) a[i] = i; return [a] }
  let v = int(rng, -20, 20)
  for (let i = 0; i < n; i++) { a[i] = v; v += int(rng, -2, 3) }
  return [a]
}
