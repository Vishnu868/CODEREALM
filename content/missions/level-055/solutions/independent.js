// Independent implementation, written without reference to reference.js.
export default (tree) => {
  // Level by level: within each level, reverse the slots.
  const out = []
  let sources = [0]
  let targets = [0]
  while (sources.length > 0) {
    const nextS = []
    const nextT = []
    for (let k = 0; k < sources.length; k++) {
      const s = sources[k]
      const t = targets[k]
      if (s >= tree.length || tree[s] === null) continue
      while (out.length <= t) out.push(null)
      out[t] = tree[s]
      nextS.push(2 * s + 1, 2 * s + 2)
      nextT.push(2 * t + 2, 2 * t + 1)
    }
    sources = nextS
    targets = nextT
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop()
  return out
}
