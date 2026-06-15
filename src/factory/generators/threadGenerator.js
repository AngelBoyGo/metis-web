import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { PATHS } from "../utils/paths.js";
import { log } from "../utils/logger.js";
import { BRAND } from "../config/brand.js";
import { sanitizeThread, lintThread } from "../utils/lint.js";

/**
 * Layer 2 — Text Thread Compiler.
 * Reads the same JSON items, sanitizes copy against the forbidden-word list
 * and tense rules, then emits two copy-paste ready artifacts per item:
 *   - <track>__<id>.txt   plain monospace thread for X/Twitter
 *   - <track>__<id>.md    annotated markdown (per-post + lint report)
 */

const SEP = "\u2500".repeat(40);

/** Build the numbered post array (hook + body + closer). */
function buildPosts(thread) {
  const posts = [];
  if (thread.hook) posts.push(thread.hook);
  for (const b of thread.body || []) posts.push(b);
  if (thread.closer) posts.push(thread.closer);
  return posts;
}

/** Plain-text thread: each post separated, indexed n/total. */
function renderTxt(item, posts, tags) {
  const total = posts.length;
  const lines = [];
  lines.push(`// ${BRAND.name} \u2014 ${item.trackLabel}`);
  lines.push(`// ${item.title}`);
  lines.push(SEP);
  lines.push("");
  posts.forEach((p, i) => {
    lines.push(`(${i + 1}/${total})`);
    lines.push(p);
    lines.push("");
  });
  if (tags?.length) {
    lines.push(SEP);
    lines.push(tags.map((t) => `#${t}`).join(" "));
  }
  return lines.join("\n");
}

/** Markdown thread: richer, with a compliance report block. */
function renderMd(item, posts, tags, violations) {
  const total = posts.length;
  const out = [];
  out.push(`# ${item.title}`);
  out.push("");
  out.push(`**Track:** ${item.trackLabel}  `);
  out.push(`**ID:** \`${item.id}\`  `);
  out.push(`**Posts:** ${total}`);
  out.push("");
  out.push("## Thread");
  out.push("");
  posts.forEach((p, i) => {
    out.push(`**${i + 1}/${total}**`);
    out.push("");
    out.push("```");
    out.push(p);
    out.push("```");
    out.push("");
  });
  if (tags?.length) {
    out.push("## Tags");
    out.push("");
    out.push(tags.map((t) => `\`#${t}\``).join(" "));
    out.push("");
  }
  out.push("## Compliance Report");
  out.push("");
  if (!violations.length) {
    out.push("- ✅ No forbidden words detected.");
    out.push("- ✅ Past/passive tense enforced (auto-sanitized copy).");
  } else {
    out.push("> ⚠️ Residual flags after sanitization (manual review):");
    out.push("");
    for (const v of violations) {
      out.push(`- \`${v.token}\` (${v.type}) ×${v.count}`);
    }
  }
  out.push("");
  return out.join("\n");
}

/** Compile one item's thread artifacts. */
export async function generateThread(item) {
  await mkdir(PATHS.threads, { recursive: true });

  // 1. sanitize against forbidden words + tense
  const clean = sanitizeThread(item.thread || {});
  // 2. lint the sanitized output to surface anything residual
  const violations = lintThread(clean);
  if (violations.length) {
    log.warn(
      `thread ${item.id}: ${violations.length} residual flag(s) after sanitize`
    );
  }

  const posts = buildPosts(clean);
  const txt = renderTxt(item, posts, item.tags);
  const md = renderMd(item, posts, item.tags, violations);

  const base = `${item.track}__${item.id}`;
  const txtPath = resolve(PATHS.threads, `${base}.txt`);
  const mdPath = resolve(PATHS.threads, `${base}.md`);
  await writeFile(txtPath, txt, "utf8");
  await writeFile(mdPath, md, "utf8");

  log.ok(`thread -> ${base}.txt / .md  (${posts.length} posts)`);
  return { txt: txtPath, md: mdPath, posts: posts.length, violations };
}

/** Compile threads for a list of items. */
export async function generateThreads(items) {
  const result = {};
  for (const item of items) {
    try {
      result[item.id] = await generateThread(item);
    } catch (e) {
      log.err(`thread failed for ${item.id}: ${e.message}`);
    }
  }
  return result;
}

export default generateThreads;
