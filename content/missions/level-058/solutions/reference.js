// Reference solution. Correct and optimal. Never shown to the player.
export default (tree, a, b) => {
  let i = 0
  while (true) {
    const v = tree[i]
    if (a < v && b < v) i = 2 * i + 1
    else if (a > v && b > v) i = 2 * i + 2
    else return v
  }
}
