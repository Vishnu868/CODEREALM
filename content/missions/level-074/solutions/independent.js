// Independent implementation, written without reference to reference.js.
export default (fragments) => {
  // Insert each value into every position of every ordering built so far,
  // then sort the results into lexicographic order.
  const values = [...fragments].sort((a, b) => a - b)
  let out = [[]]
  for (const v of values) {
    const next = []
    for (const perm of out) {
      for (let i = 0; i <= perm.length; i++) {
        next.push([...perm.slice(0, i), v, ...perm.slice(i)])
      }
    }
    out = next
  }
  out.sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
    return 0
  })
  return out
}
