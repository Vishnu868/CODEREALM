import { int } from '../../lib/rand.js'

/**
 * Operations are two parallel arrays rather than one mixed array. A single
 * array of ["push", 5] and ["min"] cannot be typed in a statically typed
 * language, and every mission input has to express itself in all of them.
 */
export default (rng, scale) => {
  const ops = []
  const values = []
  if (scale) {
    const half = Math.floor(scale / 2)
    for (let i = 0; i < half; i++) { ops.push('push'); values.push(int(rng, -1000000, 1000000)) }
    for (let i = 0; i < scale - half; i++) { ops.push('min'); values.push(0) }
    return [ops, values]
  }
  let depth = 0
  const n = int(rng, 0, 25)
  for (let i = 0; i < n; i++) {
    const r = rng()
    if (r < 0.5) { ops.push('push'); values.push(int(rng, -50, 50)); depth++ }
    else if (r < 0.7 && depth > 0) { ops.push('pop'); values.push(0); depth-- }
    else { ops.push('min'); values.push(0) }
  }
  return [ops, values]
}
