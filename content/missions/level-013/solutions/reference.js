// Reference solution. Correct and optimal. Never shown to the player.
export default (code) => {
  const clean = []
  for (const ch of code) {
    const c = ch.toLowerCase()
    if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) clean.push(c)
  }
  let i = 0
  let j = clean.length - 1
  while (i < j) {
    if (clean[i] !== clean[j]) return false
    i++
    j--
  }
  return true
}
