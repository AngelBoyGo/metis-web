import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const PROXY_TARGET = process.env.FASTAPI_PROXY_TARGET ?? "http://127.0.0.1:8000";
const SESSION_COOKIE = "metis_admin_session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    notFound();
  }

  try {
    const response = await fetch(`${PROXY_TARGET}/auth/user/me`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${session.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }
  } catch {
    notFound();
  }

  return children;
}
