import { loadAllTracks } from "./utils/content.js";
import { loadState, saveState, selectRotation } from "./utils/state.js";
import { generateImages } from "./generators/imageGenerator.js";
import { generateThreads } from "./generators/threadGenerator.js";
import { generateVideos } from "./generators/videoGenerator.js";
import { ensureAudioBeds } from "./utils/audioForge.js";
import { log } from "./utils/logger.js";

/**
 * Master Orchestrator.
 * Coordinates all three layers in order: images -> threads -> videos.
 * Honors content rotation unless `all` is requested. Designed to run with zero
 * human intervention (invoked by the scheduler or the CLI).
 *
 * @param {object} [opts]
 * @param {boolean} [opts.all=false]      process every item (ignore rotation)
 * @param {string[]} [opts.layers]        subset of ["images","threads","videos"]
 * @returns {Promise<object>} run summary
 */
export async function runFactory(opts = {}) {
  const layers = opts.layers || ["images", "threads", "videos"];
  const startedAt = Date.now();
  log.step("METIS CONTENT FACTORY :: RUN START");

  const tracks = await loadAllTracks();
  const totalItems = tracks.reduce((n, t) => n + t.items.length, 0);
  log.info(`vault: ${tracks.length} tracks / ${totalItems} items`);

  let state = await loadState();
  const { items, state: nextState } = selectRotation(tracks, state, {
    all: opts.all
  });
  log.info(
    `selected ${items.length} item(s): ${items.map((i) => i.id).join(", ")}`
  );

  const summary = { images: {}, threads: {}, videos: {}, items: items.map((i) => i.id) };

  // Pre-forge audio so video layer never blocks mid-run.
  if (layers.includes("videos")) await ensureAudioBeds();

  if (layers.includes("images")) {
    log.step("LAYER 1 :: RENDER ENGINE (images)");
    summary.images = await generateImages(items);
  }

  if (layers.includes("threads")) {
    log.step("LAYER 2 :: THREAD COMPILER (text)");
    summary.threads = await generateThreads(items);
  }

  if (layers.includes("videos")) {
    log.step("LAYER 3 :: VIDEO COMPILER (mp4)");
    summary.videos = await generateVideos(items, summary.images);
  }

  // Persist rotation + history.
  const finishedAt = Date.now();
  const record = {
    at: new Date().toISOString(),
    items: items.map((i) => i.id),
    layers,
    ms: finishedAt - startedAt
  };
  nextState.runCount = (state.runCount || 0) + 1;
  nextState.lastRun = record.at;
  nextState.history = [...(state.history || []), record].slice(-50);
  await saveState(nextState);

  log.step("RUN COMPLETE");
  log.ok(
    `run #${nextState.runCount} finished in ${(record.ms / 1000).toFixed(1)}s`
  );
  return { ...summary, run: nextState.runCount, ms: record.ms };
}

export default runFactory;
