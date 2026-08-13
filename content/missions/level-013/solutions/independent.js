// Independent implementation, written without reference to reference.js.
export default (code) => {
  const clean = code.toLowerCase().replace(/[^a-z0-9]/g, '')
  return clean === [...clean].reverse().join('')
}
