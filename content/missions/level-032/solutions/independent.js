// Independent implementation, written without reference to reference.js.
export default (table, targets) => {
  // Index the table instead of searching it — a different route to the same answers.
  const index = new Map()
  for (let i = 0; i < table.length; i++) index.set(table[i], i)
  const out = []
  for (const t of targets) out.push(index.has(t) ? index.get(t) : -1)
  return out
}
