// Independent implementation, written without reference to reference.js.
export default (stream, pattern) => {
  // Rolling hash, verifying candidates before counting them.
  const m = pattern.length
  const n = stream.length
  if (m === 0 || m > n) return 0
  const base = 131n
  const mod = 1000000007n
  let power = 1n
  for (let i = 1; i < m; i++) power = (power * base) % mod
  let target = 0n
  let window = 0n
  for (let i = 0; i < m; i++) {
    target = (target * base + BigInt(pattern.charCodeAt(i))) % mod
    window = (window * base + BigInt(stream.charCodeAt(i))) % mod
  }
  let found = 0
  for (let i = 0; ; i++) {
    if (window === target && stream.substr(i, m) === pattern) found++
    if (i + m >= n) break
    window = (window + mod - (BigInt(stream.charCodeAt(i)) * power) % mod) % mod
    window = (window * base + BigInt(stream.charCodeAt(i + m))) % mod
  }
  return found
}
