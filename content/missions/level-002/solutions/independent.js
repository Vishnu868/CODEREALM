// Independent implementation, written WITHOUT looking at reference.js.
// The verifier requires these two to agree on thousands of generated cases.
// If they disagree, one of them is wrong — that is the entire point.
export default (reading) => {
  if (reading >= 20 && reading <= 80) return 'NOMINAL'
  return reading < 20 ? 'LOW' : 'CRITICAL'
}
