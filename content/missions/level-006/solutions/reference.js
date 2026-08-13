// Reference solution. Correct and optimal. Never shown to the player.
export default (load, hasBackup) => {
  if (load < 0) return 'INVALID'
  if (load <= 50) return 'PRIMARY'
  if (hasBackup) return 'BACKUP'
  return load <= 90 ? 'PRIMARY' : 'SHUTDOWN'
}
