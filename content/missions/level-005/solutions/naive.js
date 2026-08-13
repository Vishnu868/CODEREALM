// Deliberately naive solution. The verifier asserts this FAILS the performance
// gate. If it passes, the gate is decorative and the Efficient rating is
// meaningless. Only needed for missions that define `perf`.
export default (ids) => {
  let best = null, bc = -1
  for (let i = 0; i < ids.length; i++) {
    let c = 0
    for (let j = 0; j < ids.length; j++) if (ids[j] === ids[i]) c++
    if (c > bc || (c === bc && ids[i] < best)) { best = ids[i]; bc = c }
  }
  return best
}
