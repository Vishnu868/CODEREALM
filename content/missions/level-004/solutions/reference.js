// Reference solution. Optimal and correct — it defines expected output AND the
// performance baseline. Never shown to the player.
export default (a) => {
  let mn = a[0], mx = a[0]
  for (let i = 1; i < a.length; i++) {
    if (a[i] < mn) mn = a[i]
    if (a[i] > mx) mx = a[i]
  }
  return mx - mn
}
