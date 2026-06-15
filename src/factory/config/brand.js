/**
 * Metis Brand System — single source of truth for the aesthetic.
 * Every generator (image / thread / video) imports from here so the look
 * stays identical across all three layers.
 */
export const BRAND = {
  name: "METIS",

  colors: {
    background: "#111111",
    text: "#F5F5F3",
    border: "#D4C5B9",
    dim: "#7A756E",
    ok: "#A9C5A0",
    warn: "#D8C08A",
    err: "#C98F8F",
    grid: "#1C1C1C"
  },

  font: {
    family:
      "'JetBrains Mono', 'IBM Plex Mono', 'DejaVu Sans Mono', 'Courier New', monospace",
    weightRegular: 400,
    weightBold: 600
  },

  geometry: {
    borderRadius: 0,
    borderWidth: 1,
    asymmetric: {
      top: "1px",
      right: "1px",
      bottom: "3px",
      left: "3px"
    }
  },

  canvas: {
    image: { width: 1080, height: 1350 },
    video: { width: 1080, height: 1920 }
  }
};

/** Words that must never appear in published copy. */
export const FORBIDDEN_WORDS = [
  "should",
  "ought",
  "proves",
  "validates",
  "demonstrates",
  "successfully",
  "will"
];

/** Primary telemetry vault filename. */
export const VAULT_FILE = "telemetry_vault.json";

export default BRAND;
