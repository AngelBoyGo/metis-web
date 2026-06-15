import { BRAND } from "../config/brand.js";
import { esc, kicker, footer, htmlDoc } from "./base.js";

const C = BRAND.colors;

/** Track C — prosumer architecture blueprint. */
export function renderTemplates(item) {
  const css = `
    .blueprint { flex:1; display:flex; flex-direction:column; gap:30px; }
    .spec {
      border:1px solid ${C.grid};
      background:#0C0C0C;
    }
    .spec .row {
      display:flex; justify-content:space-between;
      padding:16px 24px; font-size:24px;
      border-bottom:1px solid ${C.grid};
    }
    .spec .row:last-child { border-bottom:none; }
    .spec .k { color:${C.border}; letter-spacing:2px; }
    .spec .v { color:${C.text}; text-align:right; }
    .blocks { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
    .block {
      border:1px solid ${C.border};
      border-bottom-width:3px;
      padding:20px 22px;
      background:transparent;
    }
    .block .bl {
      font-size:23px; font-weight:${BRAND.font.weightBold};
      letter-spacing:3px; color:${C.text}; margin-bottom:10px;
      display:flex; align-items:center; gap:10px;
    }
    .block .bl::before { content:"\\25A0"; color:${C.border}; font-size:16px; }
    .block .bd { font-size:21px; line-height:1.4; color:${C.dim}; }
  `;

  const spec = (item.blueprint?.spec || [])
    .map(
      (r) =>
        `<div class="row"><span class="k">${esc(
          r.key
        )}</span><span class="v">${esc(r.value)}</span></div>`
    )
    .join("");

  const blocks = (item.blueprint?.blocks || [])
    .map(
      (b) =>
        `<div class="block"><div class="bl">${esc(
          b.label
        )}</div><div class="bd">${esc(b.detail)}</div></div>`
    )
    .join("");

  const body = `
    ${kicker(item.trackLabel)}
    <div class="title">${esc(item.title)}</div>
    ${item.subtitle ? `<div class="subtitle">${esc(item.subtitle)}</div>` : ""}
    <div class="blueprint">
      <div class="spec">${spec}</div>
      <div class="blocks">${blocks}</div>
    </div>
    ${footer(item.tags)}
  `;
  return htmlDoc(css, body);
}

export default renderTemplates;
