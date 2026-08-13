// Reference solution. Correct and optimal. Never shown to the player.
export default (command) => {
  const match = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const ch of command) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch)
    else if (stack.pop() !== match[ch]) return false
  }
  return stack.length === 0
}
