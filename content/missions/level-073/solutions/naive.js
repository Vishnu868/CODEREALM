// Deliberately naive. The verifier asserts this fails the performance gate.
export default (jobs) => {
  // Repeatedly scan for the shortest remaining job.
  const pool = [...jobs]
  let elapsed = 0
  let total = 0
  while (pool.length > 0) {
    let idx = 0
    for (let i = 1; i < pool.length; i++) if (pool[i] < pool[idx]) idx = i
    elapsed += pool[idx]
    total += elapsed
    pool.splice(idx, 1)
  }
  return total
}
