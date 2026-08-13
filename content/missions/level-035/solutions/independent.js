// Independent implementation, written without reference to reference.js.
export default (channels, target) => {
  for (let i = 0; i < channels.length; i++) if (channels[i] === target) return i
  return -1
}
