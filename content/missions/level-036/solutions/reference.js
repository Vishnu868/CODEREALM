// Reference solution. Correct and optimal. Never shown to the player.
export default (a, b) => {
  const out = new Array(a.length + b.length)
  let i = 0
  let j = 0
  let k = 0
  while (i < a.length && j < b.length) out[k++] = a[i] <= b[j] ? a[i++] : b[j++]
  while (i < a.length) out[k++] = a[i++]
  while (j < b.length) out[k++] = b[j++]
  return out
}
