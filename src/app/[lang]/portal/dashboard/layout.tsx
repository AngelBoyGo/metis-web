import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PROXY_TARGET = process.env.FASTAPI_PROXY_TARGET ?? "http://127.0.0.1:8000";
const SESSION_COOKIE = "metis_user_session";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function PortalDashboardLayout({ children, params }: Props) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    redirect(`/${lang}/portal/login`);
  }

  try {
    const response = await fetch(`${PROXY_TARGET}/auth/user/me`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${session.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      redirect(`/${lang}/portal/login`);
    }
  } catch {
    return children;
  }

  return children;
}
