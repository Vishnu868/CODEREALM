import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const alphabet = 'abcXY19'
  const n = int(rng, 0, 30)
  let out = ''
  for (let i = 0; i < n; i++) out += pick(rng, alphabet.split(''))
  return [out]
}
