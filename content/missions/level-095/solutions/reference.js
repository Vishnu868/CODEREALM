// Reference solution. Correct and optimal. Iterative throughout.
export default (stream, pattern) => {
  const m = pattern.length
  if (m === 0 || m > stream.length) return 0
  // Longest proper prefix that is also a suffix, per pattern position.
  const fallback = new Int32Array(m)
  let len = 0
  for (let i = 1; i < m; i++) {
    while (len > 0 && pattern[i] !== pattern[len]) len = fallback[len - 1]
    if (pattern[i] === pattern[len]) len++
    fallback[i] = len
  }
  let matched = 0
  let found = 0
  for (let i = 0; i < stream.length; i++) {
    while (matched > 0 && stream[i] !== pattern[matched]) matched = fallback[matched - 1]
    if (stream[i] === pattern[matched]) matched++
    if (matched === m) { found++; matched = fallback[m - 1] }
  }
  return found
}
