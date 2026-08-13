// Independent implementation, written without reference to reference.js.
export default (n) => {
  // Keep the chosen columns as a list and check each candidate against them all.
  const chosen = []
  const place = (row) => {
    if (row === n) return 1
    let found = 0
    for (let col = 0; col < n; col++) {
      let ok = true
      for (let r = 0; r < chosen.length; r++) {
        if (chosen[r] === col || Math.abs(chosen[r] - col) === row - r) { ok = false; break }
      }
      if (!ok) continue
      chosen.push(col)
      found += place(row + 1)
      chosen.pop()
    }
    return found
  }
  return place(0)
}
