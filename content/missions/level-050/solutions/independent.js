// Independent implementation, written without reference to reference.js.
export default (heights) => {
  const n = heights.length
  if (n === 0) return 0
  // Nearest strictly shorter column on each side, computed separately.
  const leftBound = new Array(n)
  const rightBound = new Array(n)
  const s1 = []
  for (let i = 0; i < n; i++) {
    while (s1.length && heights[s1[s1.length - 1]] >= heights[i]) s1.pop()
    leftBound[i] = s1.length ? s1[s1.length - 1] : -1
    s1.push(i)
  }
  const s2 = []
  for (let i = n - 1; i >= 0; i--) {
    while (s2.length && heights[s2[s2.length - 1]] >= heights[i]) s2.pop()
    rightBound[i] = s2.length ? s2[s2.length - 1] : n
    s2.push(i)
  }
  let best = 0
  for (let i = 0; i < n; i++) {
    best = Math.max(best, heights[i] * (rightBound[i] - leftBound[i] - 1))
  }
  return best
}
