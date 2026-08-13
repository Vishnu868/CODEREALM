// Independent implementation, written without reference to reference.js.
export default (generators) => {
  // Grow the collection element by element, then place each subset at the index
  // its binary pattern demands.
  const n = generators.length
  const out = new Array(1 << n)
  let built = [[]]
  for (const v of generators) built = built.concat(built.map((s) => [...s, v]))
  for (const subset of built) {
    let k = 0
    let at = 0
    for (const v of subset) {
      while (generators[at] !== v) at++
      k |= 1 << at
    }
    out[k] = subset
  }
  return out
}
