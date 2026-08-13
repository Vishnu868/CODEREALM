// Deliberately naive. The verifier asserts this fails the performance gate.
export default (heights) => {
  let best = 0
  for (let i = 0; i < heights.length; i++) {
    let lowest = heights[i]
    for (let j = i; j < heights.length; j++) {
      if (heights[j] < lowest) lowest = heights[j]
      const area = lowest * (j - i + 1)
      if (area > best) best = area
    }
  }
  return best
}
