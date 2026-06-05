import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";

type PageShellProps = {
  children: React.ReactNode;
  navMode?: "routes" | "anchors";
};

export default function PageShell({ children, navMode = "routes" }: PageShellProps) {
  return (
    <div className="page-shell">
      <SiteNav mode={navMode} />
      <main className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
