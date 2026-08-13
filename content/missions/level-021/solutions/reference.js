// Reference solution. Correct and optimal. Never shown to the player.
export default (updates, queries) => {
  const table = new Map()
  for (const [k, v] of updates) table.set(k, v)
  return queries.map((k) => (table.has(k) ? table.get(k) : -1))
}
