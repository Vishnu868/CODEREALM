// Reference solution. Correct and optimal. Never shown to the player.
export default (repairs) => {
  if (repairs.length === 0) return 0
  const sorted = [...repairs].sort((a, b) => b[1] - a[1])
  let latest = 0
  for (const [deadline] of sorted) if (deadline > latest) latest = deadline
  // parent[c] is the latest free cycle at or before c.
  const parent = new Int32Array(latest + 1)
  for (let i = 0; i <= latest; i++) parent[i] = i
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  let total = 0
  for (const [deadline, value] of sorted) {
    const slot = find(deadline)
    if (slot > 0) { total += value; parent[slot] = slot - 1 }
  }
  return total
}
