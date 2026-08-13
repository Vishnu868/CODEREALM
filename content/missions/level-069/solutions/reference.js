// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const neighbours = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) {
    neighbours[u].push([v, w])
    neighbours[v].push([u, w])
  }
  const best = new Array(n).fill(Infinity)
  best[0] = 0
  // Binary heap of [cost, node].
  const heap = [[0, 0]]
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
  while (heap.length > 0) {
    const [cost, node] = pop()
    if (cost > best[node]) continue
    for (const [next, w] of neighbours[node]) {
      if (cost + w < best[next]) {
        best[next] = cost + w
        push([cost + w, next])
      }
    }
  }
  return best[n - 1] === Infinity ? -1 : best[n - 1]
}
