// Reference solution. Correct and optimal. Never shown to the player.
export default (values, target) => {
  for (let i = 0; i < values.length; i++) if (values[i] === target) return i
  return -1
}
