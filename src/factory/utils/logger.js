/** Minimal timestamped logger with a Metis-flavored prefix. */
const ts = () => new Date().toISOString().replace("T", " ").slice(0, 19);

const fmt = (level, msg) => `[${ts()}] ${level.padEnd(5)} :: ${msg}`;

export const log = {
  info: (m) => console.log(fmt("INFO", m)),
  ok: (m) => console.log(fmt("OK", m)),
  warn: (m) => console.warn(fmt("WARN", m)),
  err: (m) => console.error(fmt("ERR", m)),
  step: (m) => console.log(`\n\u2500\u2500 ${m} ${"\u2500".repeat(Math.max(0, 48 - m.length))}`)
};

export default log;
