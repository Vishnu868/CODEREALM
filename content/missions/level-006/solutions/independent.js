// Independent implementation, written without reference to reference.js.
export default (load, hasBackup) => {
  if (load < 0) return 'INVALID'
  if (hasBackup) return load <= 50 ? 'PRIMARY' : 'BACKUP'
  if (load <= 90) return 'PRIMARY'
  return 'SHUTDOWN'
}
