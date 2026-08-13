// Independent implementation, written WITHOUT looking at reference.js.
// The verifier requires these two to agree on thousands of generated cases.
// If they disagree, one of them is wrong — that is the entire point.
export default (n) => {
  let total = 0
  for (let i = 1; i <= n; i++) total += i
  return total
}
