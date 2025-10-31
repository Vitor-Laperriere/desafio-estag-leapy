export async function httpGet(url: string, init?: RequestInit) {
    const res = await fetch(url, { ...init });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res;
  }