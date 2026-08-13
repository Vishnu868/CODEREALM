// Reference solution. Correct and optimal. Iterative throughout.
export default (readings, k) => {
  if (k === 0) return 0
  const counts = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < readings.length; right++) {
    const v = readings[right]
    counts.set(v, (counts.get(v) || 0) + 1)
    while (counts.size > k) {
      const leaving = readings[left]
      const remaining = counts.get(leaving) - 1
      if (remaining === 0) counts.delete(leaving)
      else counts.set(leaving, remaining)
      left++
    }
    const width = right - left + 1
    if (width > best) best = width
  }
  return best
}
