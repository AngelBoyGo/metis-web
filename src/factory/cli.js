#!/usr/bin/env node
import { runFactory } from "./orchestrator.js";
import { loadAllTracks } from "./utils/content.js";
import { loadState } from "./utils/state.js";
import { log } from "./utils/logger.js";

/**
 * Metis Content Factory — CLI.
 *
 * Usage:
 *   node src/cli.js run        run all layers (rotation advances)
 *   node src/cli.js run --all  run all layers for EVERY item
 *   node src/cli.js images     render images only
 *   node src/cli.js threads    compile text threads only
 *   node src/cli.js videos     compile videos only
 *   node src/cli.js list       list the content vault
 *   node src/cli.js status     show rotation/run state
 *   node src/cli.js help       show this help
 *
 * Flags:
 *   --all   ignore rotation and process the entire vault
 */

const HELP = `
METIS CONTENT FACTORY \u2014 CLI
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  run [--all]     run all three layers (images + threads + videos)
  images [--all]  Layer 1 only \u2014 render 1080x1350 PNG cards
  threads [--all] Layer 2 only \u2014 compile X/Twitter text threads
  videos [--all]  Layer 3 only \u2014 compile 1080x1920 MP4 shorts
  list            print the content vault (tracks + items)
  status          print rotation cursor + run history
  help            show this message

  --all           ignore rotation; process every item in the vault
`;

async function cmdList() {
  const tracks = await loadAllTracks();
  for (const t of tracks) {
    console.log(`\n[${t.track}] ${t.trackLabel}  (${t.items.length} items)`);
    t.items.forEach((it, i) =>
      console.log(`   ${String(i + 1).padStart(2, "0")}. ${it.id}  \u2014 ${it.title}`)
    );
  }
  console.log("");
}

async function cmdStatus() {
  const state = await loadState();
  console.log("\nMETIS FACTORY STATUS");
  console.log("\u2500".repeat(40));
  console.log(`runs        : ${state.runCount || 0}`);
  console.log(`last run    : ${state.lastRun || "never"}`);
  console.log(`cursor      : ${JSON.stringify(state.cursor || {})}`);
  const last = (state.history || []).slice(-5).reverse();
  if (last.length) {
    console.log("\nrecent runs:");
    last.forEach((r) =>
      console.log(`  ${r.at}  [${r.items.join(", ")}]  ${(r.ms / 1000).toFixed(1)}s`)
    );
  }
  console.log("");
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = (args[0] || "help").toLowerCase();
  const all = args.includes("--all");

  try {
    switch (cmd) {
      case "run":
        await runFactory({ all });
        break;
      case "images":
        await runFactory({ all, layers: ["images"] });
        break;
      case "threads":
        await runFactory({ all, layers: ["threads"] });
        break;
      case "videos":
        await runFactory({ all, layers: ["videos"] });
        break;
      case "list":
        await cmdList();
        break;
      case "status":
        await cmdStatus();
        break;
      case "help":
      case "-h":
      case "--help":
      default:
        console.log(HELP);
        break;
    }
  } catch (e) {
    log.err(e.stack || e.message);
    process.exit(1);
  }
}

main();
