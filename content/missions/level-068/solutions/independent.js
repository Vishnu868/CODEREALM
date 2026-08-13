// Independent implementation, written without reference to reference.js.
export default (n, edges) => {
  // Repeatedly take the lowest-numbered task with no unfinished prerequisites.
  const blockedBy = Array.from({ length: n }, () => new Set())
  for (const e of edges) blockedBy[e[1]].add(e[0])
  const done = new Array(n).fill(false)
  const out = []
  for (let step = 0; step < n; step++) {
    for (let i = 0; i < n; i++) {
      if (done[i]) continue
      let ready = true
      for (const dep of blockedBy[i]) if (!done[dep]) { ready = false; break }
      if (ready) { done[i] = true; out.push(i); break }
    }
  }
  return out
}
