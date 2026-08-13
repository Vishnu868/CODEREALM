// Independent implementation, written without reference to reference.js.
export default (ops, values) => {
  const stack = []
  const out = []
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === 'push') {
      const best = stack.length === 0 ? values[i] : Math.min(stack[stack.length - 1][1], values[i])
      stack.push([values[i], best])
    } else if (ops[i] === 'pop') stack.pop()
    else out.push(stack.length === 0 ? -1 : stack[stack.length - 1][1])
  }
  return out
}
