// Reference solution. Optimal and correct — it defines expected output AND the
// performance baseline. Never shown to the player.
export default (r) => (r < 20 ? 'LOW' : r > 80 ? 'CRITICAL' : 'NOMINAL')
