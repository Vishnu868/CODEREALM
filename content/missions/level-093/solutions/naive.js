// Deliberately naive. The verifier asserts this fails the performance gate.
export default (sections, k) => {
  // Walk candidate caps upward one at a time.
  const groupsNeeded = (cap) => {
    let groups = 1
    let load = 0
    for (const w of sections) {
      if (load + w > cap) { groups++; load = 0 }
      load += w
    }
    return groups
  }
  let cap = Math.max(...sections)
  while (groupsNeeded(cap) > k) cap++
  return cap
}
