// Independent implementation, written without reference to reference.js.
export default (frequencies, target) => {
  // Smallest j wins, so scan j outward and i inward for each j.
  for (let j = 1; j < frequencies.length; j++) {
    for (let i = 0; i < j; i++) {
      if (frequencies[i] + frequencies[j] === target) return [i, j]
    }
  }
  return []
}
