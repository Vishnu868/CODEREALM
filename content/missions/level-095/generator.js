import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  if (scale) {
    // A long run of one character with a same-character pattern: every position
    // is a near-match, which is the worst case for a restart-on-mismatch scan.
    return ['a'.repeat(scale), 'a'.repeat(1000)]
  }
  const alphabet = pick(rng, ['ab', 'abc'])
  const make = (len) => {
    let s = ''
    for (let i = 0; i < len; i++) s += pick(rng, alphabet.split(''))
    return s
  }
  return [make(int(rng, 0, 20)), make(int(rng, 0, 4))]
}
