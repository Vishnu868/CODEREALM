// Reference solution. Correct and optimal. Iterative rather than recursive:
// a 200,000-node graph would exhaust the call stack in either runtime.
export default (n, edges) => {
  const dependents = Array.from({ length: n }, () => [])
  const waiting = new Array(n).fill(0)
  for (const [u, v] of edges) {
    dependents[u].push(v)
    waiting[v]++
  }
  // A sorted array acts as the "always smallest" structure.
  const ready = []
  for (let i = 0; i < n; i++) if (waiting[i] === 0) ready.push(i)
  const insert = (x) => {
    let lo = 0
    let hi = ready.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (ready[mid] < x) lo = mid + 1
      else hi = mid
    }
    ready.splice(lo, 0, x)
  }
  const out = []
  while (ready.length > 0) {
    const task = ready.shift()
    out.push(task)
    for (const next of dependents[task]) {
      if (--waiting[next] === 0) insert(next)
    }
  }
  return out
}
