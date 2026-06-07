import Link from "next/link";
import LangIndicator from "@/components/LangIndicator";
import { gate } from "@/content/site";

export default function Home() {
  return (
    <div className="gate-shell">
      <header className="gate-header">
        <p className="gate-wordmark font-serif">{gate.wordmark}</p>
        <LangIndicator />
      </header>
      <main className="gate-main">
        <div className="gate-split">
          <Link href={gate.pathA.href} className="gate-path gate-path-a">
            <span className="gate-path-code font-mono">
              {gate.pathA.code} {"//"}
            </span>
            <span className="gate-path-label font-mono">{gate.pathA.label}</span>
            <span className="gate-path-desc">{gate.pathA.description}</span>
          </Link>
          <Link href={gate.pathB.href} className="gate-path gate-path-b">
            <span className="gate-path-code font-mono">
              {gate.pathB.code} {"//"}
            </span>
            <span className="gate-path-label font-mono">{gate.pathB.label}</span>
            <span className="gate-path-desc">{gate.pathB.description}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
