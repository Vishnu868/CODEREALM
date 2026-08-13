// Deliberately naive. The verifier asserts this fails the performance gate.
export default (strengths, k) => {
  if (k < 1 || k > strengths.length) return -1
  const pool = [...strengths]
  let best = 0
  for (let round = 0; round < k; round++) {
    let idx = 0
    for (let i = 1; i < pool.length; i++) if (pool[i] > pool[idx]) idx = i
    best = pool[idx]
    pool.splice(idx, 1)
  }
  return best
}
