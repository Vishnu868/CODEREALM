import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const alphabet = 'abc'
  let out = ''
  const runs = int(rng, 0, 8)
  for (let i = 0; i < runs; i++) {
    const ch = pick(rng, alphabet.split(''))
    const len = int(rng, 1, 6)
    for (let j = 0; j < len; j++) out += ch
  }
  return [out]
}
