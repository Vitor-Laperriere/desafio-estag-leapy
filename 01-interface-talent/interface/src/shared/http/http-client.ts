const DEFAULT_TIMEOUT_MS = 0;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type HttpRequestInit = RequestInit & {
  timeoutMs?: number;
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`HTTP request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId!);
  }
}

async function httpRequest(url: string, init: HttpRequestInit = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  const request = fetch(url, rest);
  const res = timeoutMs > 0 ? await withTimeout(request, timeoutMs) : await request;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
}

function buildJsonInit(method: HttpMethod, body?: unknown, init?: HttpRequestInit): HttpRequestInit {
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

export async function httpGet(url: string, init?: HttpRequestInit) {
  return httpRequest(url, { ...init, method: "GET" });
}

export async function httpPost(url: string, body?: unknown, init?: HttpRequestInit) {
  return httpRequest(url, buildJsonInit("POST", body, init));
}

export async function httpPatch(url: string, body?: unknown, init?: HttpRequestInit) {
  return httpRequest(url, buildJsonInit("PATCH", body, init));
}

export async function httpDelete(url: string, body?: unknown, init?: HttpRequestInit) {
  return httpRequest(url, buildJsonInit("DELETE", body, init));
}
