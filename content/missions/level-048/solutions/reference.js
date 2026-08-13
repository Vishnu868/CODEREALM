// Reference solution. Correct and optimal. Never shown to the player.
export default (ops, values) => {
  const stack = []
  const minima = []
  const out = []
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === 'push') {
      stack.push(values[i])
      minima.push(minima.length === 0 ? values[i] : Math.min(minima[minima.length - 1], values[i]))
    } else if (ops[i] === 'pop') {
      stack.pop()
      minima.pop()
    } else {
      out.push(minima.length === 0 ? -1 : minima[minima.length - 1])
    }
  }
  return out
}
