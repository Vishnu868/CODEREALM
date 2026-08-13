// Deliberately naive. The verifier asserts this fails the performance gate.
export default (addresses) => {
  for (let i = 0; i < addresses.length; i++) {
    for (let j = i + 1; j < addresses.length; j++) {
      if (addresses[i] === addresses[j]) return true
    }
  }
  return false
}
