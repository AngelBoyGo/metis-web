import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_SESSION_COOKIE } from "@/lib/portal-session";
import DashboardShell, { type Operator } from "../components/DashboardShell";

const PROXY_TARGET = process.env.FASTAPI_PROXY_TARGET ?? "http://127.0.0.1:8000";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

/** Normalizes the upstream customer session response for dashboard rendering. */
function parseOperator(data: unknown): Operator | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  const email = record.email;
  if (typeof email !== "string" || !email.trim()) {
    return null;
  }
  return {
    id: typeof record.id === "string" ? record.id : undefined,
    email: email.trim(),
    name: typeof record.name === "string" ? record.name.trim() : undefined,
  };
}

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
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      redirect(`/${lang}/portal/login`);
    }
    const operator = parseOperator(await response.json());
    if (!operator) {
      redirect(`/${lang}/portal/login`);
    }
    return <DashboardShell lang={lang} operator={operator}>{children}</DashboardShell>;
  } catch {
    redirect(`/${lang}/portal/login`);
  }
}
