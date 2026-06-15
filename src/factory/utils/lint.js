import { FORBIDDEN_WORDS } from "../config/brand.js";

/**
 * Copy linter for the Metis voice.
 *  - flags forbidden words (case-insensitive, whole-word)
 *  - flags future tense markers and imperative future framing
 *  - flags present-progressive that breaks the past/passive house style
 */

const FORBIDDEN_RX = FORBIDDEN_WORDS.map((w) => ({
  word: w,
  rx: new RegExp(`\\b${w}\\b`, "gi")
}));

// Heuristic future / non-past markers beyond the explicit forbidden list.
const FUTURE_RX = [
  { label: "future: going to", rx: /\bgoing to\b/gi },
  { label: "future: shall", rx: /\bshall\b/gi },
  { label: "future contraction: 'll", rx: /\b\w+'ll\b/gi }
];

/** Scan a single string. Returns array of violation objects. */
export function lintText(text = "") {
  const violations = [];
  for (const { word, rx } of FORBIDDEN_RX) {
    const m = text.match(rx);
    if (m) violations.push({ type: "forbidden", token: word, count: m.length });
  }
  for (const { label, rx } of FUTURE_RX) {
    const m = text.match(rx);
    if (m) violations.push({ type: "tense", token: label, count: m.length });
  }
  return violations;
}

/** Lint every string field used in a thread. Returns flat violation list. */
export function lintThread(thread = {}) {
  const parts = [thread.hook, ...(thread.body || []), thread.closer].filter(
    Boolean
  );
  const all = [];
  parts.forEach((p, i) => {
    lintText(p).forEach((v) => all.push({ ...v, segment: i, text: p }));
  });
  return all;
}

/**
 * Best-effort auto-sanitizer. Rewrites the most common forbidden tokens into
 * compliant past/passive equivalents so the pipeline never emits a banned word.
 * Anything it cannot safely rewrite is left for the lint report to surface.
 */
const REWRITES = [
  [/\bwill not\b/gi, "was not"],
  [/\bwill\b/gi, "was"],
  [/\bshould\b/gi, "was set to"],
  [/\bought to\b/gi, "was set to"],
  [/\bought\b/gi, "was set to"],
  [/\bproves\b/gi, "showed"],
  [/\bproved\b/gi, "showed"],
  [/\bvalidates\b/gi, "confirmed"],
  [/\bvalidated\b/gi, "confirmed"],
  [/\bdemonstrates\b/gi, "showed"],
  [/\bdemonstrated\b/gi, "showed"],
  [/\bsuccessfully\b/gi, "without exception"],
  [/\bgoing to\b/gi, "set to"],
  [/\bshall\b/gi, "was"]
];

export function sanitizeText(text = "") {
  let out = text;
  for (const [rx, rep] of REWRITES) out = out.replace(rx, rep);
  // collapse any double spaces introduced by rewrites
  return out.replace(/\s{2,}/g, " ").trim();
}

export function sanitizeThread(thread = {}) {
  return {
    hook: sanitizeText(thread.hook || ""),
    body: (thread.body || []).map(sanitizeText),
    closer: sanitizeText(thread.closer || "")
  };
}

export default { lintText, lintThread, sanitizeText, sanitizeThread };
