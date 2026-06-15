type CookieStore = {
  get: (name: string) => { value: string } | undefined;
};

export const USER_SESSION_COOKIE = "metis_user_session";
export const ADMIN_SESSION_COOKIE = "metis_admin_session";

/** Resolve whichever portal session cookie the browser holds (user or admin tier). */
export function getPortalSessionCookie(cookies: CookieStore) {
  return cookies.get(USER_SESSION_COOKIE) ?? cookies.get(ADMIN_SESSION_COOKIE);
}

/** Build a Cookie header value for upstream /auth/user/me validation. */
export function portalSessionCookieHeader(cookies: CookieStore): string | null {
  const user = cookies.get(USER_SESSION_COOKIE);
  if (user?.value) {
    return `${USER_SESSION_COOKIE}=${user.value}`;
  }
  const admin = cookies.get(ADMIN_SESSION_COOKIE);
  if (admin?.value) {
    return `${ADMIN_SESSION_COOKIE}=${admin.value}`;
  }
  return null;
}
