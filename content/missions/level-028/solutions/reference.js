// Reference solution. Correct and optimal. Never shown to the player.
export default (packet) => {
  const counts = new Map()
  for (const ch of packet) counts.set(ch, (counts.get(ch) || 0) + 1)
  for (let i = 0; i < packet.length; i++) {
    if (counts.get(packet[i]) === 1) return i
  }
  return -1
}
