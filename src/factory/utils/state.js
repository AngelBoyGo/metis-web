import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { PATHS } from "./paths.js";

/**
 * Persistent rotation state. Tracks which content item was published last per
 * track so each scheduled run advances the rotation instead of repeating.
 */
const DEFAULT = { runCount: 0, lastRun: null, cursor: {}, history: [] };

export async function loadState() {
  try {
    return JSON.parse(await readFile(PATHS.state, "utf8"));
  } catch {
    return { ...DEFAULT };
  }
}

export async function saveState(state) {
  await mkdir(dirname(PATHS.state), { recursive: true });
  await writeFile(PATHS.state, JSON.stringify(state, null, 2), "utf8");
}

/**
 * Given all tracks, select the next item from each track based on the cursor,
 * then advance the cursor. Returns the chosen items + the mutated state.
 *
 * @param {object[]} tracks  output of loadAllTracks()
 * @param {object} state
 * @param {object} [opts]
 * @param {boolean} [opts.all=false]  when true, returns every item (no rotation)
 */
export function selectRotation(tracks, state, opts = {}) {
  if (opts.all) {
    const items = tracks.flatMap((t) => t.items);
    return { items, state };
  }
  const cursor = { ...(state.cursor || {}) };
  const items = [];
  for (const t of tracks) {
    if (!t.items.length) continue;
    const idx = (cursor[t.track] || 0) % t.items.length;
    items.push(t.items[idx]);
    cursor[t.track] = (idx + 1) % t.items.length;
  }
  return { items, state: { ...state, cursor } };
}

export default { loadState, saveState, selectRotation };
