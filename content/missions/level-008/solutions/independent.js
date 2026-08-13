// Independent implementation, written without reference to reference.js.
const clamp = (v) => Math.min(100, Math.max(0, v))
export default (readings, offset) => readings.map((r) => clamp(r + offset))
