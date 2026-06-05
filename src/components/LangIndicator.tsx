import { langIndicator } from "@/content/site";

export default function LangIndicator() {
  return (
    <div className="lang-indicator" aria-label="Language">
      <span className="lang-indicator-active" aria-current="true">
        {langIndicator.active.label}
      </span>
      <span className="lang-indicator-divider" aria-hidden="true">
        |
      </span>
      <span className="lang-indicator-disabled" aria-disabled="true">
        {langIndicator.comingSoon.label}
      </span>
    </div>
  );
}
