export function sessionCookieOptions() {
  const isDev = process.env.NODE_ENV === "development";
  return {
    httpOnly: true,
    path: "/",
    secure: !isDev,
    sameSite: (isDev ? "lax" : "strict") as "lax" | "strict",
  };
}
