import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // Worst case: every character repeats, so the answer is -1 and nothing can
    // exit early.
    let out = ''
    for (let i = 0; i < scale / 2; i++) { const c = String.fromCharCode(32 + (i % 90)); out += c + c }
    return [out]
  }
  const alphabet = pick(rng, ['ab', 'abc', 'abcde'])
  const n = int(rng, 0, 25)
  let out = ''
  for (let i = 0; i < n; i++) out += pick(rng, alphabet.split(''))
  return [out]
}
