import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const pairs = [['(', ')'], ['[', ']'], ['{', '}']]
  const build = (depth) => {
    if (depth <= 0 || rng() < 0.3) return ''
    const [open, close] = pick(rng, pairs)
    return open + build(depth - 1) + close + (rng() < 0.4 ? build(depth - 1) : '')
  }
  let s = build(int(rng, 0, 4))
  // Corrupt it half the time so invalid inputs are well represented.
  if (s.length > 0 && rng() < 0.5) {
    const chars = [...s]
    const i = int(rng, 0, chars.length - 1)
    chars[i] = pick(rng, '()[]{}'.split(''))
    s = chars.join('')
  }
  return [s]
}
