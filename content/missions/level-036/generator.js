import { int, pick } from '../../lib/rand.js'

export default (rng, scale) => {
  const n = scale ?? int(rng, 0, 20)
  const m = scale ? Math.floor(n / 2) : int(rng, 0, 20)
  const build = (len) => {
    const arr = new Array(len)
    let v = int(rng, 0, 5)
    for (let i = 0; i < len; i++) { arr[i] = v; v += int(rng, 0, 3) }
    return arr
  }
  return [build(n), build(m)]
}
