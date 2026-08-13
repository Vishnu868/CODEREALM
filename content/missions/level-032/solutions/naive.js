// Deliberately naive. The verifier asserts this fails the performance gate.
export default (table, targets) => targets.map((target) => {
  for (let i = 0; i < table.length; i++) if (table[i] === target) return i
  return -1
})
