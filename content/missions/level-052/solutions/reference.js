// Reference solution. Correct and optimal. Never shown to the player.
export default (tree) => {
  if (tree.length === 0 || tree[0] === null) return []
  const out = []
  let queue = [0]
  while (queue.length > 0) {
    const level = []
    const next = []
    for (const i of queue) {
      level.push(tree[i])
      for (const child of [2 * i + 1, 2 * i + 2]) {
        if (child < tree.length && tree[child] !== null) next.push(child)
      }
    }
    out.push(level)
    queue = next
  }
  return out
}
