// Independent implementation, written without reference to reference.js.
export default (table, target) => {
  for (let i = 0; i < table.length; i++) if (table[i] >= target) return i
  return table.length
}
