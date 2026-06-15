import { BRAND } from "../config/brand.js";
import { esc, kicker, footer, htmlDoc } from "./base.js";

const C = BRAND.colors;

const LINE_COLOR = {
  cmd: C.text,
  out: C.dim,
  ok: C.ok,
  warn: C.warn,
  err: C.err
};

/** Track A — terminal / console aesthetic. */
export function renderDiagnostics(item) {
  const css = `
    .console {
      flex:1;
      background:#0C0C0C;
      border:1px solid ${C.grid};
      padding:30px 32px;
      font-size:25px; line-height:1.62;
      display:flex; flex-direction:column; gap:2px;
      overflow:hidden;
    }
    .term-head {
      display:flex; gap:10px; align-items:center;
      color:${C.dim}; font-size:20px; letter-spacing:2px;
      padding-bottom:16px; margin-bottom:18px;
      border-bottom:1px solid ${C.grid};
    }
    .dot { width:11px; height:11px; border:1px solid ${C.border}; display:inline-block; }
    .ln { white-space:pre-wrap; word-break:break-word; }
    .ln .prompt { color:${C.border}; }
    .ln.cmd { color:${LINE_COLOR.cmd}; font-weight:${BRAND.font.weightBold}; }
    .ln.out { color:${LINE_COLOR.out}; }
    .ln.ok  { color:${LINE_COLOR.ok}; }
    .ln.warn{ color:${LINE_COLOR.warn}; }
    .ln.err { color:${LINE_COLOR.err}; }
    .ln .badge { display:inline-block; min-width:54px; color:${C.dim}; }
  `;

  const host = esc(item.console?.host || "metis@node");
  const lines = (item.console?.lines || [])
    .map((l) => {
      const type = l.type || "out";
      if (type === "cmd") {
        return `<div class="ln cmd"><span class="prompt">${host} $</span> ${esc(
          l.text
        )}</div>`;
      }
      const badge =
        type === "ok"
          ? "[ ok ]"
          : type === "warn"
          ? "[warn]"
          : type === "err"
          ? "[fail]"
          : "      ";
      return `<div class="ln ${type}"><span class="badge">${badge}</span> ${esc(
        l.text
      )}</div>`;
    })
    .join("");

  const body = `
    ${kicker(item.trackLabel)}
    <div class="title">${esc(item.title)}</div>
    ${item.subtitle ? `<div class="subtitle">${esc(item.subtitle)}</div>` : ""}
    <div class="console">
      <div class="term-head"><span class="dot"></span> ${host} \u2014 metisctl session</div>
      ${lines}
    </div>
    ${footer(item.tags)}
  `;
  return htmlDoc(css, body);
}

export default renderDiagnostics;
