// Independent implementation, written without reference to reference.js.
export default (repairs) => {
  // Sweep deadlines upward keeping the best values in a min-heap of size equal
  // to the number of cycles used so far.
  const sorted = [...repairs].sort((a, b) => a[0] - b[0])
  const heap = []
  const push = (v) => {
    heap.push(v)
    let i = heap.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p] <= heap[i]) break
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
        if (l < heap.length && heap[l] < heap[small]) small = l
        if (r < heap.length && heap[r] < heap[small]) small = r
        if (small === i) break
        ;[heap[small], heap[i]] = [heap[i], heap[small]]
        i = small
      }
    }
    return top
  }
  let total = 0
  for (const [deadline, value] of sorted) {
    push(value)
    total += value
    if (heap.length > deadline) total -= pop()
  }
  return total
}
