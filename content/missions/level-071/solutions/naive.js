// Deliberately naive. The verifier asserts this fails the performance gate.
export default (windows) => {
  // Longest chain by pairwise comparison against every earlier window.
  const sorted = [...windows].sort((a, b) => a[1] - b[1])
  const best = new Array(sorted.length).fill(1)
  let answer = 0
  for (let i = 0; i < sorted.length; i++) {
    for (let j = 0; j < i; j++) {
      if (sorted[j][1] <= sorted[i][0] && best[j] + 1 > best[i]) best[i] = best[j] + 1
    }
    if (best[i] > answer) answer = best[i]
  }
  return answer
}
