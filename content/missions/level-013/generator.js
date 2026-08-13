import { int, pick } from '../../lib/rand.js'

export default (rng) => {
  const letters = 'abcXYZ019'
  const junk = ' -_.,!'
  const n = int(rng, 0, 14)
  let core = ''
  for (let i = 0; i < n; i++) core += pick(rng, letters.split(''))
  // Half the time build something that really is a mirror.
  if (rng() < 0.5) {
    const half = core
    core = half + (rng() < 0.5 ? '' : pick(rng, letters.split(''))) + [...half].reverse().join('')
  }
  let out = ''
  for (const ch of core) {
    if (rng() < 0.25) out += pick(rng, junk.split(''))
    out += rng() < 0.3 ? ch.toUpperCase() : ch
  }
  return [out]
}
