async function httpRequest(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
}

export async function httpGet(url: string, init?: RequestInit) {
  return httpRequest(url, init);
}

function buildJsonInit(
  method: string,
  body?: unknown,
  init?: RequestInit
): RequestInit {
  if (body instanceof FormData) {
    return {
      ...init,
      method,
      body,
    };
  }

  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return {
    ...init,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export async function httpPost(url: string, body?: unknown, init?: RequestInit) {
  return httpRequest(url, buildJsonInit("POST", body, init));
}

export async function httpPatch(
  url: string,
  body?: unknown,
  init?: RequestInit
) {
  return httpRequest(url, buildJsonInit("PATCH", body, init));
}

export async function httpDelete(
  url: string,
  body?: unknown,
  init?: RequestInit
) {
  return httpRequest(url, buildJsonInit("DELETE", body, init));
}
