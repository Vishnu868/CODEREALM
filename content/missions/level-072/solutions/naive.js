// Deliberately naive. The verifier asserts this fails the performance gate.
export default (windows) => {
  // Count, for every window, how many others are open when it starts.
  let best = 0
  for (let i = 0; i < windows.length; i++) {
    let open = 0
    for (let j = 0; j < windows.length; j++) {
      if (windows[j][0] <= windows[i][0] && windows[j][1] > windows[i][0]) open++
    }
    if (open > best) best = open
  }
  return best
}
