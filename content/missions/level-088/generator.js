import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const alphabet = 'abcd'
  const make = (len) => {
    let s = ''
    for (let i = 0; i < len; i++) s += pick(rng, alphabet.split(''))
    return s
  }
  return [make(int(rng, 0, 12)), make(int(rng, 0, 12))]
}
