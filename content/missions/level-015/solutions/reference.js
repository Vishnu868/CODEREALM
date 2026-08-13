// Reference solution. Correct and optimal. Never shown to the player.
export default (charges, target) => {
  let i = 0
  let j = charges.length - 1
  while (i < j) {
    const sum = charges[i] + charges[j]
    if (sum === target) return [i, j]
    if (sum < target) i++
    else j--
  }
  return []
}
