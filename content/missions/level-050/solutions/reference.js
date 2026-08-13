// Reference solution. Correct and optimal. Never shown to the player.
export default (heights) => {
  const stack = []
  let best = 0
  for (let i = 0; i <= heights.length; i++) {
    const current = i === heights.length ? -1 : heights[i]
    while (stack.length > 0 && heights[stack[stack.length - 1]] > current) {
      const height = heights[stack.pop()]
      const left = stack.length === 0 ? -1 : stack[stack.length - 1]
      const area = height * (i - left - 1)
      if (area > best) best = area
    }
    stack.push(i)
  }
  return best
}
