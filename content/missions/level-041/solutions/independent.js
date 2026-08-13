// Independent implementation, written without reference to reference.js.
export default (n) => {
  let steps = 0
  while (n > 1) {
    n = n % 2 === 0 ? n / 2 : n - 1
    steps++
  }
  return steps
}
