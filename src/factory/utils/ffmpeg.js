import { spawn } from "child_process";

/** Critical error string emitted when the ffmpeg prerequisite was absent. */
export const FFMPEG_MISSING_MESSAGE =
  "METIS_FACTORY_CRITICAL_ERROR // PREREQUISITE_MISSING // SYSTEMS_REQUIRE_FFMPEG_ON_PATH";

/**
 * Probe the global PATH for an ffmpeg binary.
 * Resolves true when `ffmpeg -version` was spawned and exited cleanly.
 * @returns {Promise<boolean>}
 */
export function ffmpegAvailable() {
  return new Promise((res) => {
    let proc;
    try {
      proc = spawn("ffmpeg", ["-version"], {
        stdio: ["ignore", "ignore", "ignore"]
      });
    } catch {
      res(false);
      return;
    }
    proc.on("error", () => res(false));
    proc.on("close", (code) => res(code === 0));
  });
}

/**
 * Defensive guard. When ffmpeg was not found on PATH, a clean error string was
 * emitted and the process exited with code 1 rather than throwing a raw ENOENT.
 * @returns {Promise<void>}
 */
export async function assertFfmpeg() {
  const present = await ffmpegAvailable();
  if (!present) {
    console.error(FFMPEG_MISSING_MESSAGE);
    process.exit(1);
  }
}

export default assertFfmpeg;
