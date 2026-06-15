import { readFile } from "fs/promises";
import { resolve } from "path";
import { PATHS } from "./paths.js";
import { VAULT_FILE } from "../config/brand.js";

/**
 * Load the telemetry vault and normalize items so each carries its track id and label.
 */
export async function loadVault() {
  const full = resolve(PATHS.content, VAULT_FILE);
  const raw = await readFile(full, "utf8");
  const data = JSON.parse(raw);
  return data;
}

/** Load every track from the vault (in file order). */
export async function loadAllTracks() {
  const data = await loadVault();
  const tracks = (data.tracks || []).map((t) => {
    const items = (t.items || []).map((it) => ({
      ...it,
      track: it.track || t.track,
      trackLabel: it.trackLabel || t.trackLabel
    }));
    return { ...t, file: VAULT_FILE, items };
  });
  return tracks;
}

/** Flatten all tracks into a single item list. */
export async function loadAllItems() {
  const tracks = await loadAllTracks();
  return tracks.flatMap((t) => t.items);
}

export default { loadVault, loadAllTracks, loadAllItems };
