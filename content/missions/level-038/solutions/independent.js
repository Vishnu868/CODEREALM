// Independent implementation, written without reference to reference.js.
export default (strengths, k) => {
  if (k < 1 || k > strengths.length) return -1
  const ascending = [...strengths].sort((x, y) => x - y)
  return ascending[ascending.length - k]
}
