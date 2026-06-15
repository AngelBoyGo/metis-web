import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Factory package root (`src/factory`). */
export const FACTORY_ROOT = resolve(__dirname, "..");

/** Website project root (three levels up from `src/factory/utils`). */
export const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");

export const PATHS = {
  factory: FACTORY_ROOT,
  project: PROJECT_ROOT,
  config: resolve(FACTORY_ROOT, "config"),
  content: resolve(FACTORY_ROOT, "content"),
  templates: resolve(FACTORY_ROOT, "templates"),
  assets: resolve(FACTORY_ROOT, "assets"),
  audio: resolve(FACTORY_ROOT, "assets", "audio"),
  fonts: resolve(FACTORY_ROOT, "assets", "fonts"),
  output: resolve(PROJECT_ROOT, "output"),
  images: resolve(PROJECT_ROOT, "output", "images"),
  threads: resolve(PROJECT_ROOT, "output", "threads"),
  videos: resolve(PROJECT_ROOT, "output", "videos"),
  state: resolve(PROJECT_ROOT, "output", ".state.json")
};

export default PATHS;
