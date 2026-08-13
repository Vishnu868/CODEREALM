// Deliberately naive. The verifier asserts this fails the performance gate.
export default (stream, pattern) => {
  const m = pattern.length
  if (m === 0 || m > stream.length) return 0
  let found = 0
  for (let i = 0; i + m <= stream.length; i++) {
    let j = 0
    while (j < m && stream[i + j] === pattern[j]) j++
    if (j === m) found++
  }
  return found
}
