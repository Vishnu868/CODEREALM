// Deliberately naive. The verifier asserts this fails the performance gate.
export default (ops, values) => {
  const stack = []
  const out = []
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === 'push') stack.push(values[i])
    else if (ops[i] === 'pop') stack.pop()
    else {
      if (stack.length === 0) out.push(-1)
      else {
        let best = stack[0]
        for (let j = 1; j < stack.length; j++) if (stack[j] < best) best = stack[j]
        out.push(best)
      }
    }
  }
  return out
}
