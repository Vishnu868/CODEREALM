// Reference solution. Correct and optimal. Never shown to the player.
export default (frequencies, target) => {
  const seen = new Map()
  for (let j = 0; j < frequencies.length; j++) {
    const want = target - frequencies[j]
    if (seen.has(want)) return [seen.get(want), j]
    if (!seen.has(frequencies[j])) seen.set(frequencies[j], j)
  }
  return []
}
