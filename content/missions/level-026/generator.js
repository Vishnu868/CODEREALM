import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const alphabet = 'abcXY'
  const n = int(rng, 0, 12)
  let a = ''
  for (let i = 0; i < n; i++) a += pick(rng, alphabet.split(''))
  if (rng() < 0.5) {
    const chars = [...a]
    for (let i = chars.length - 1; i > 0; i--) {
      const j = int(rng, 0, i);[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    if (rng() < 0.3 && chars.length > 0) chars[int(rng, 0, chars.length - 1)] = pick(rng, alphabet.split(''))
    return [a, chars.join('')]
  }
  let b = ''
  const m = int(rng, 0, 12)
  for (let i = 0; i < m; i++) b += pick(rng, alphabet.split(''))
  return [a, b]
}
