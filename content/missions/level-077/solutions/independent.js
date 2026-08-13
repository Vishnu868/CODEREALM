// Independent implementation, written without reference to reference.js.
export default (sizes, target) => {
  // Counting table: process one size at a time so order never matters.
  const ways = new Array(target + 1).fill(0)
  ways[0] = 1
  for (const size of sizes) {
    for (let total = size; total <= target; total++) ways[total] += ways[total - size]
  }
  return ways[target]
}
