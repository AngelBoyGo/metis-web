import { mkdir, access } from "fs/promises";
import { resolve } from "path";
import { spawn } from "child_process";
import { PATHS } from "./paths.js";
import { log } from "./logger.js";
import { assertFfmpeg } from "./ffmpeg.js";

/**
 * AudioForge — synthesizes royalty-free ambient beds with ffmpeg so the
 * factory ships with usable industrial / synth-wave audio out of the box and
 * never depends on external downloads. Users can drop their own .mp3/.wav into
 * assets/audio/ to override these.
 */

const run = (args) =>
  new Promise((res, rej) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => (c === 0 ? res() : rej(new Error(err.slice(-400)))));
  });

const exists = (f) =>
  access(f).then(
    () => true,
    () => false
  );

/**
 * Each bed is built from layered sine drones + filtered noise to evoke a
 * low industrial / synth-wave atmosphere. Defined as ffmpeg lavfi graphs.
 */
const BEDS = {
  // Deep obsidian drone — slow, sub-heavy
  "ambient-obsidian.wav": {
    dur: 12,
    graph:
      "sine=frequency=55:sample_rate=44100[a];" +
      "sine=frequency=82.5:sample_rate=44100[b];" +
      "anoisesrc=color=brown:amplitude=0.06:sample_rate=44100[n];" +
      "[a][b]amix=inputs=2:weights=0.6 0.4[t];" +
      "[t][n]amix=inputs=2:weights=0.85 0.15,lowpass=f=900,volume=0.5[out]"
  },
  // Champagne pulse — mid synth shimmer with slow tremolo
  "ambient-champagne.wav": {
    dur: 12,
    graph:
      "sine=frequency=110:sample_rate=44100[a];" +
      "sine=frequency=165:sample_rate=44100[b];" +
      "[a][b]amix=inputs=2:weights=0.55 0.45,tremolo=f=0.25:d=0.7,lowpass=f=1600,volume=0.42[out]"
  },
  // Carbon static — industrial filtered-noise bed
  "ambient-carbon.wav": {
    dur: 12,
    graph:
      "sine=frequency=65:sample_rate=44100[a];" +
      "anoisesrc=color=pink:amplitude=0.09:sample_rate=44100[n];" +
      "[a][n]amix=inputs=2:weights=0.7 0.3,highpass=f=60,lowpass=f=1200,volume=0.45[out]"
  }
};

export const AUDIO_BEDS = Object.keys(BEDS);

/** Synthesize any missing beds. Idempotent. */
export async function ensureAudioBeds() {
  // Defensive prerequisite guard — a missing ffmpeg binary exits cleanly.
  await assertFfmpeg();
  await mkdir(PATHS.audio, { recursive: true });
  for (const [name, def] of Object.entries(BEDS)) {
    const out = resolve(PATHS.audio, name);
    if (await exists(out)) continue;
    log.info(`forging audio bed ${name}`);
    await run([
      "-y",
      "-filter_complex",
      def.graph,
      "-map",
      "[out]",
      "-t",
      String(def.dur),
      "-ar",
      "44100",
      "-ac",
      "2",
      out
    ]);
  }
  return AUDIO_BEDS.map((n) => resolve(PATHS.audio, n));
}

export default ensureAudioBeds;
