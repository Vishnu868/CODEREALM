// Independent implementation, written without reference to reference.js.
export default (n, activation, links) => {
  // Grow outward from the virtual source, always taking the cheapest link that
  // reaches an unpowered node.
  const neighbours = Array.from({ length: n + 1 }, () => [])
  for (let i = 0; i < n; i++) {
    neighbours[n].push([i, activation[i]])
    neighbours[i].push([n, activation[i]])
  }
  for (const [u, v, w] of links) {
    neighbours[u].push([v, w])
    neighbours[v].push([u, w])
  }
  const powered = new Array(n + 1).fill(false)
  const heap = [[0, n]]
  const push = (item) => {
    heap.push(item)
    let i = heap.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p][0] <= heap[i][0]) break
      ;[heap[p], heap[i]] = [heap[i], heap[p]]
      i = p
    }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      while (true) {
        const l = 2 * i + 1
        const r = 2 * i + 2
        let small = i
        if (l < heap.length && heap[l][0] < heap[small][0]) small = l
        if (r < heap.length && heap[r][0] < heap[small][0]) small = r
        if (small === i) break
        ;[heap[small], heap[i]] = [heap[i], heap[small]]
        i = small
      }
    }
    return top
  }
  let total = 0
  while (heap.length > 0) {
    const [cost, node] = pop()
    if (powered[node]) continue
    powered[node] = true
    total += cost
    for (const [next, w] of neighbours[node]) if (!powered[next]) push([w, next])
  }
  return total
}
