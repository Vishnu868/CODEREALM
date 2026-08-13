// Independent implementation, written WITHOUT looking at reference.js.
// The verifier requires these two to agree on thousands of generated cases.
// If they disagree, one of them is wrong — that is the entire point.
export default (count) => {
  let out = ''
  for (let i = 0; i < count; i++) out += (i ? ' ' : '') + 'SIGNAL'
  return out
}
