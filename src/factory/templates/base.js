import { BRAND } from "../config/brand.js";

const C = BRAND.colors;
const G = BRAND.geometry;

/** HTML-escape helper. */
export const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Shared CSS for every card. Enforces the exact Metis spec:
 *  - #111111 Matte Obsidian Carbon background
 *  - #F5F5F3 Warm Alabaster monospace text
 *  - #D4C5B9 Muted Champagne 1px asymmetric border
 *  - zero border-radius everywhere
 */
export function baseCSS() {
  const { width, height } = BRAND.canvas.image;
  return `
    * { margin:0; padding:0; box-sizing:border-box; border-radius:${G.borderRadius}px !important; }
    html,body { width:${width}px; height:${height}px; }
    body {
      background:${C.background};
      color:${C.text};
      font-family:${BRAND.font.family};
      font-weight:${BRAND.font.weightRegular};
      -webkit-font-smoothing:antialiased;
      position:relative;
      overflow:hidden;
    }
    /* hairline blueprint grid baked into the carbon background */
    body::before {
      content:"";
      position:absolute; inset:0;
      background-image:
        linear-gradient(${C.grid} 1px, transparent 1px),
        linear-gradient(90deg, ${C.grid} 1px, transparent 1px);
      background-size:16px 16px;
      opacity:.55;
      pointer-events:none;
    }
    .frame {
      position:absolute;
      inset:40px;
      /* asymmetric 1px champagne outline */
      border-style:solid;
      border-color:${C.border};
      border-top-width:${G.asymmetric.top};
      border-right-width:${G.asymmetric.right};
      border-bottom-width:${G.asymmetric.bottom};
      border-left-width:${G.asymmetric.left};
      padding:56px 52px;
      display:flex;
      flex-direction:column;
    }
    .kicker {
      font-size:22px; letter-spacing:6px; text-transform:uppercase;
      color:${C.border};
      display:flex; justify-content:space-between; align-items:center;
      padding-bottom:22px; margin-bottom:34px;
      border-bottom:1px solid ${C.grid};
    }
    .kicker .brand { font-weight:${BRAND.font.weightBold}; color:${C.text}; }
    .title {
      font-size:54px; line-height:1.12; font-weight:${BRAND.font.weightBold};
      letter-spacing:-1px; margin-bottom:14px;
    }
    .subtitle { font-size:25px; line-height:1.4; color:${C.dim}; margin-bottom:38px; }
    .spacer { flex:1; }
    .footer {
      display:flex; justify-content:space-between; align-items:flex-end;
      padding-top:24px; margin-top:28px; border-top:1px solid ${C.grid};
      font-size:21px; color:${C.dim};
    }
    .tags { display:flex; gap:14px; flex-wrap:wrap; }
    .tag {
      border:1px solid ${C.border}; color:${C.border};
      padding:6px 14px; font-size:19px; letter-spacing:1px;
    }
    .sig { color:${C.border}; letter-spacing:3px; }
  `;
}

/** Standard kicker row (track label + brand mark). */
export function kicker(trackLabel) {
  return `<div class="kicker"><span class="track">${esc(
    trackLabel || ""
  )}</span><span class="brand">${BRAND.name}</span></div>`;
}

/** Standard footer with tag chips + signature. */
export function footer(tags = []) {
  const chips = (tags || [])
    .map((t) => `<span class="tag">#${esc(t)}</span>`)
    .join("");
  return `<div class="footer"><div class="tags">${chips}</div><div class="sig">// METIS</div></div>`;
}

/** Wrap a body fragment + section CSS into a full HTML document. */
export function htmlDoc(sectionCSS, bodyInner) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${baseCSS()}
    ${sectionCSS || ""}
  </style></head><body><div class="frame">${bodyInner}</div></body></html>`;
}

export default { esc, baseCSS, kicker, footer, htmlDoc };
