import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { portalSessionCookieHeader } from "@/lib/portal-session";
import DashboardShell from "../components/DashboardShell";

const PROXY_TARGET = process.env.FASTAPI_PROXY_TARGET ?? "http://127.0.0.1:8000";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function PortalDashboardLayout({ children, params }: Props) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const sessionHeader = portalSessionCookieHeader(cookieStore);

  if (!sessionHeader) {
    redirect(`/${lang}/portal/login`);
  }

  try {
    const response = await fetch(`${PROXY_TARGET}/auth/user/me`, {
      headers: {
        Cookie: sessionHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      redirect(`/${lang}/portal/login`);
    }
  } catch {
    return <DashboardShell lang={lang}>{children}</DashboardShell>;
  }

  return <DashboardShell lang={lang}>{children}</DashboardShell>;
}
