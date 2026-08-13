// Independent implementation, written without reference to reference.js.
export default (base, exp) => {
  let result = 1
  for (let i = 0; i < exp; i++) result *= base
  return result
}
