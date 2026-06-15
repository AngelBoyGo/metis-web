import { mkdir, access } from "fs/promises";
import { resolve } from "path";
import { spawn } from "child_process";
import { BRAND } from "../config/brand.js";
import { PATHS } from "../utils/paths.js";
import { log } from "../utils/logger.js";
import { ensureAudioBeds, AUDIO_BEDS } from "../utils/audioForge.js";
import { assertFfmpeg } from "../utils/ffmpeg.js";

/**
 * Layer 3 — Video Compiler.
 * Takes a generated 1080x1350 PNG, composites it centered on a 1080x1920
 * carbon canvas, applies a subtle Ken-Burns motion (pan / zoom), and mixes in
 * an ambient audio bed. Output is a publication-ready vertical MP4.
 */

const FPS = 30;
const { width: VW, height: VH } = BRAND.canvas.video;

const exists = (f) =>
  access(f).then(
    () => true,
    () => false
  );

const run = (args) =>
  new Promise((res, rej) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) =>
      c === 0 ? res() : rej(new Error(err.slice(-600)))
    );
  });

/**
 * Build the zoompan expression for a given motion type.
 * zoompan runs on an upscaled frame so motion stays crisp.
 */
function motionFilter(motion, totalFrames) {
  const z = "min(zoom+0.0010,1.18)"; // gentle continuous zoom for zoom-in
  const zOut = "if(eq(on,0),1.18,max(zoom-0.0010,1.0))"; // zoom-out
  // Upscale source so panning has headroom, then zoompan, then pad to canvas.
  const common = `scale=${VW * 2}:-1,setsar=1`;
  let zp;
  switch (motion) {
    case "zoom-out":
      zp = `zoompan=z='${zOut}':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${VW}x${VH}:fps=${FPS}`;
      break;
    case "pan-up":
      zp = `zoompan=z='1.12':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(1-on/${totalFrames})':s=${VW}x${VH}:fps=${FPS}`;
      break;
    case "pan-down":
      zp = `zoompan=z='1.12':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(on/${totalFrames})':s=${VW}x${VH}:fps=${FPS}`;
      break;
    case "zoom-in":
    default:
      zp = `zoompan=z='${z}':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${VW}x${VH}:fps=${FPS}`;
      break;
  }
  // After zoompan we already have a VWxVH frame; ensure even dims + format.
  return `${common},${zp},format=yuv420p`;
}

/** Pick an audio bed for an item (explicit, or rotated by id hash). */
function pickAudio(item, index) {
  const a = item.video?.audio;
  if (a && a !== "auto") {
    const explicit = resolve(PATHS.audio, a);
    return explicit;
  }
  const pick = AUDIO_BEDS[index % AUDIO_BEDS.length];
  return resolve(PATHS.audio, pick);
}

/**
 * Compile a single video.
 * @param {object} item content item (must have matching image already)
 * @param {string} imagePath path to the source PNG
 * @param {number} index rotation index for audio selection
 */
export async function generateVideo(item, imagePath, index = 0) {
  await mkdir(PATHS.videos, { recursive: true });
  await ensureAudioBeds();

  if (!(await exists(imagePath))) {
    throw new Error(`source image missing: ${imagePath}`);
  }

  const duration = Math.max(4, item.video?.duration || 8);
  const totalFrames = Math.round(duration * FPS);
  const motion = item.video?.motion || "zoom-in";
  const audioPath = pickAudio(item, index);
  const haveAudio = await exists(audioPath);

  const base = `${item.track}__${item.id}`;
  const outPath = resolve(PATHS.videos, `${base}.mp4`);

  const vf = motionFilter(motion, totalFrames);

  const args = [
    "-y",
    "-loop",
    "1",
    "-i",
    imagePath
  ];

  if (haveAudio) {
    args.push("-stream_loop", "-1", "-i", audioPath);
  }

  args.push(
    "-t",
    String(duration),
    "-vf",
    vf,
    "-r",
    String(FPS)
  );

  if (haveAudio) {
    // gentle fade in/out on the audio bed
    args.push(
      "-af",
      `afade=t=in:st=0:d=1.2,afade=t=out:st=${duration - 1.2}:d=1.2`,
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-shortest"
    );
  }

  args.push(
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "high",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-movflags",
    "+faststart",
    outPath
  );

  await run(args);
  log.ok(
    `video  -> ${base}.mp4  (${VW}x${VH}, ${duration}s, ${motion}${
      haveAudio ? ", +audio" : ""
    })`
  );
  return outPath;
}

/**
 * Compile videos for a list of items.
 * @param {object[]} items
 * @param {Object<string,string>} imageMap  id -> image path (from Layer 1)
 */
export async function generateVideos(items, imageMap = {}) {
  // Defensive prerequisite guard — a missing ffmpeg binary exits cleanly.
  await assertFfmpeg();
  await ensureAudioBeds();
  const result = {};
  let i = 0;
  for (const item of items) {
    try {
      const img =
        imageMap[item.id] ||
        resolve(PATHS.images, `${item.track}__${item.id}.png`);
      result[item.id] = await generateVideo(item, img, i++);
    } catch (e) {
      log.err(`video failed for ${item.id}: ${e.message}`);
    }
  }
  return result;
}

export default generateVideos;
