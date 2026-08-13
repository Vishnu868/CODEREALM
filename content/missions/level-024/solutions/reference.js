// Reference solution. Correct and optimal. Never shown to the player.
export default (values, queries) => {
  const prefix = new Array(values.length + 1)
  prefix[0] = 0
  for (let i = 0; i < values.length; i++) prefix[i + 1] = prefix[i] + values[i]
  return queries.map(([l, r]) => prefix[r + 1] - prefix[l])
}
