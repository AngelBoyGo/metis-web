import puppeteer from "puppeteer";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { BRAND } from "../config/brand.js";
import { PATHS } from "../utils/paths.js";
import { log } from "../utils/logger.js";
import { renderItem } from "../templates/index.js";

/**
 * Layer 1 — Headless Render Engine.
 * Renders each content item to a 1080x1350 PNG via Puppeteer, then runs the
 * raw buffer through sharp to guarantee exact dimensions + clean compression.
 */
export class ImageGenerator {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (this.browser) return;
    this.browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--font-render-hinting=none",
        "--force-color-profile=srgb"
      ]
    });
    await mkdir(PATHS.images, { recursive: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate a single PNG for an item.
   * @returns {Promise<string>} absolute path to the written PNG
   */
  async generate(item) {
    await this.init();
    const { width, height } = BRAND.canvas.image;
    const page = await this.browser.newPage();
    try {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const html = renderItem(item);
      await page.setContent(html, { waitUntil: "networkidle0" });
      // small settle for webfont/layout
      await new Promise((r) => setTimeout(r, 120));

      const raw = await page.screenshot({ type: "png" });
      const outPath = resolve(PATHS.images, `${item.track}__${item.id}.png`);

      // Normalize to exact spec dimensions through sharp.
      const buf = await sharp(raw)
        .resize(width, height, { fit: "cover", position: "top" })
        .png({ compressionLevel: 9 })
        .toBuffer();
      await writeFile(outPath, buf);

      log.ok(`image  -> ${item.track}__${item.id}.png  (${width}x${height})`);
      return outPath;
    } finally {
      await page.close();
    }
  }

  /** Generate images for a list of items. Returns map id -> path. */
  async generateMany(items) {
    await this.init();
    const result = {};
    for (const item of items) {
      try {
        result[item.id] = await this.generate(item);
      } catch (e) {
        log.err(`image failed for ${item.id}: ${e.message}`);
      }
    }
    return result;
  }
}

/** Convenience one-shot helper that manages the browser lifecycle. */
export async function generateImages(items) {
  const gen = new ImageGenerator();
  try {
    return await gen.generateMany(items);
  } finally {
    await gen.close();
  }
}

export default ImageGenerator;
