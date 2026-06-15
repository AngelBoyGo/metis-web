const OFFLINE_MESSAGE = "[OFFLINE] TELEMETRY_CARRIER_LINK_DISCONNECTED //";

export type ApiFetchInit = RequestInit & {
  cacheBust?: boolean;
};

/**
 * Portal fetch helper with session cookies and optional cache bust query param.
 */
export async function apiFetch(
  input: string,
  init?: ApiFetchInit,
): Promise<Response> {
  const { cacheBust, ...rest } = init ?? {};
  let url = input;
  if (cacheBust) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}_ts=${Date.now()}`;
  }
  return fetch(url, { ...rest, credentials: "include" });
}

export { OFFLINE_MESSAGE };
