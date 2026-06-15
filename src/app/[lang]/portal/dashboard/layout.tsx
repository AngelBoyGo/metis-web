import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_SESSION_COOKIE } from "@/lib/portal-session";
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
  const userSession = cookieStore.get(USER_SESSION_COOKIE);

  if (!userSession?.value) {
    redirect(`/${lang}/portal/login`);
  }

  try {
    const response = await fetch(`${PROXY_TARGET}/auth/user/me`, {
      headers: {
        Cookie: `${USER_SESSION_COOKIE}=${userSession.value}`,
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
