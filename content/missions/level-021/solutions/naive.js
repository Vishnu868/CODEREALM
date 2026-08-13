// Deliberately naive. The verifier asserts this fails the performance gate.
export default (updates, queries) => queries.map((k) => {
  let found = -1
  for (let i = 0; i < updates.length; i++) if (updates[i][0] === k) found = updates[i][1]
  return found
})
