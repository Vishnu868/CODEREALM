// Deliberately naive. The verifier asserts this fails the performance gate.
export default (values, queries) => queries.map(([l, r]) => {
  let s = 0
  for (let i = l; i <= r; i++) s += values[i]
  return s
})
