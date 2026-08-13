// Reference solution. Correct and optimal. Never shown to the player.
export default (generators) => {
  const n = generators.length
  const out = []
  for (let k = 0; k < (1 << n); k++) {
    const subset = []
    for (let i = 0; i < n; i++) if (k & (1 << i)) subset.push(generators[i])
    out.push(subset)
  }
  return out
}
