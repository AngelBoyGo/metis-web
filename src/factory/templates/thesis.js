import { BRAND } from "../config/brand.js";
import { esc, kicker, footer, htmlDoc } from "./base.js";

const C = BRAND.colors;

/** Track B — JMIR metrics overlay / compliance thesis card. */
export function renderThesis(item) {
  const css = `
    .source {
      font-size:21px; letter-spacing:2px; color:${C.border};
      margin-bottom:30px;
    }
    .grid2 {
      display:grid; grid-template-columns:1fr 1fr; gap:20px;
      margin-bottom:40px;
    }
    .stat {
      border:1px solid ${C.grid};
      border-left:3px solid ${C.border};
      padding:24px 26px;
      background:#0C0C0C;
    }
    .stat .value {
      font-size:62px; font-weight:${BRAND.font.weightBold};
      line-height:1; letter-spacing:-2px; color:${C.text};
    }
    .stat .label {
      font-size:21px; letter-spacing:2px; text-transform:uppercase;
      color:${C.dim}; margin-top:12px;
    }
    .thesis {
      border-left:3px solid ${C.border};
      padding:8px 0 8px 28px;
      font-size:33px; line-height:1.42; color:${C.text};
    }
    .thesis::before { content:"\\201C"; color:${C.border}; font-size:48px; margin-right:6px; }
  `;

  const stats = (item.metrics?.stats || [])
    .map(
      (s) =>
        `<div class="stat"><div class="value">${esc(
          s.value
        )}</div><div class="label">${esc(s.label)}</div></div>`
    )
    .join("");

  const body = `
    ${kicker(item.trackLabel)}
    <div class="title">${esc(item.title)}</div>
    ${item.subtitle ? `<div class="subtitle">${esc(item.subtitle)}</div>` : ""}
    ${
      item.metrics?.source
        ? `<div class="source">SOURCE \u2014 ${esc(item.metrics.source)}</div>`
        : ""
    }
    <div class="grid2">${stats}</div>
    <div class="spacer"></div>
    ${
      item.metrics?.thesis
        ? `<div class="thesis">${esc(item.metrics.thesis)}</div>`
        : ""
    }
    ${footer(item.tags)}
  `;
  return htmlDoc(css, body);
}

export default renderThesis;
