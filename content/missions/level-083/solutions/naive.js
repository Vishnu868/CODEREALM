// Deliberately naive. The verifier asserts this fails the performance gate.
export default (cells) => {
  // For each cell, rescan every earlier non-adjacent position.
  const n = cells.length
  if (n === 0) return 0
  const best = new Array(n).fill(0)
  let answer = 0
  for (let i = 0; i < n; i++) {
    best[i] = cells[i]
    for (let j = 0; j <= i - 2; j++) {
      if (best[j] + cells[i] > best[i]) best[i] = best[j] + cells[i]
    }
    if (best[i] > answer) answer = best[i]
  }
  return answer
}
