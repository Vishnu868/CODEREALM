// Independent implementation, written without reference to reference.js.
export default (command) => {
  // Repeatedly delete adjacent matching pairs; a valid string collapses to nothing.
  let s = command
  let previous = null
  while (s !== previous) {
    previous = s
    s = s.replace('()', '').replace('[]', '').replace('{}', '')
  }
  return s.length === 0
}
