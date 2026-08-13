import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // Worst case: all distinct, so the window never shrinks and a naive re-scan
    // from every start does maximum work.
    let out = ''
    for (let i = 0; i < scale; i++) out += String.fromCharCode(32 + (i % 90))
    return [out]
  }
  const alphabet = pick(rng, ['ab', 'abc', 'abcdef'])
  const n = int(rng, 0, 25)
  let out = ''
  for (let i = 0; i < n; i++) out += pick(rng, alphabet.split(''))
  return [out]
}
