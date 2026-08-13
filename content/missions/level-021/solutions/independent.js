// Independent implementation, written without reference to reference.js.
export default (updates, queries) => {
  const table = Object.create(null)
  for (let i = 0; i < updates.length; i++) table[updates[i][0]] = updates[i][1]
  const out = []
  for (const k of queries) out.push(k in table ? table[k] : -1)
  return out
}
