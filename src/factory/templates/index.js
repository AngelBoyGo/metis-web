import { renderDiagnostics } from "./diagnostics.js";
import { renderThesis } from "./thesis.js";
import { renderTemplates } from "./templates.js";

/** Map a track id to its HTML renderer. */
const RENDERERS = {
  systemDiagnostics: renderDiagnostics,
  sovereignCompliance: renderThesis,
  prosumerTemplates: renderTemplates
};

/** Return the HTML string for an item based on its track. */
export function renderItem(item) {
  const fn = RENDERERS[item.track];
  if (!fn) {
    throw new Error(`No template registered for track "${item.track}"`);
  }
  return fn(item);
}

export { RENDERERS };
export default renderItem;
