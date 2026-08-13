// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Same walk, breadth first with an index-based queue.
  const neighbours = Array.from({ length: n }, () => [])
  for (const e of edges) {
    neighbours[e[0]].push(e[1])
    neighbours[e[1]].push(e[0])
  }
  const seen = new Set([0])
  const queue = [0]
  for (let i = 0; i < queue.length; i++) {
    for (const nb of neighbours[queue[i]]) {
      if (!seen.has(nb)) { seen.add(nb); queue.push(nb) }
    }
  }
  return [...seen].sort((a, b) => a - b)
}
