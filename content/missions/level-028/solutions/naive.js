// Deliberately naive. The verifier asserts this fails the performance gate.
export default (packet) => {
  for (let i = 0; i < packet.length; i++) {
    let count = 0
    for (let j = 0; j < packet.length; j++) if (packet[j] === packet[i]) count++
    if (count === 1) return i
  }
  return -1
}
