// Deliberately naive. The verifier asserts this fails the performance gate.
export default (a, b) => {
  const out = []
  for (let i = 0; i < a.length; i++) {
    let inB = false
    for (let j = 0; j < b.length; j++) if (a[i] === b[j]) { inB = true; break }
    if (inB && !out.includes(a[i])) out.push(a[i])
  }
  return out.sort((x, y) => x - y)
}
