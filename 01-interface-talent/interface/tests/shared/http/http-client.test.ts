import { afterEach, describe, expect, it, vi } from "vitest";

import { httpDelete, httpGet, httpPatch, httpPost } from "@shared/http/http-client";

const successResponse = (body: string | object = "{}") =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: 200,
  });

const errorResponse = (body = "boom", status = 500) =>
  new Response(body, {
    status,
  });

describe("http-client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("envia JSON com content-type padrão", async () => {
    const fetchMock = vi.fn().mockResolvedValue(successResponse());
    vi.stubGlobal("fetch", fetchMock);

    await httpPost("https://api.test/items", { foo: "bar" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
      })
    );

    const init = fetchMock.mock.calls[0][1]!;
    const headers = init.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("não força content-type quando body é FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue(successResponse());
    vi.stubGlobal("fetch", fetchMock);

    const form = new FormData();
    form.append("file", new Blob(["hello"], { type: "text/plain" }), "file.txt");

    await httpPatch("https://api.test/upload", form);

    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(form);
    expect(init.headers).toBeUndefined();
  });

  it("propaga erros HTTP com detalhe da resposta", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorResponse("invalid", 422));
    vi.stubGlobal("fetch", fetchMock);

    await expect(httpGet("https://api.test/fail")).rejects.toThrowError(
      "HTTP 422: invalid"
    );
  });

  it("interrompe requisições quando o timeout expira", async () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    vi.useFakeTimers();
    const request = httpDelete("https://api.test/resource", undefined, {
      timeoutMs: 2000,
    });

    const assertion = expect(request).rejects.toThrowError(
      "HTTP request timed out after 2000ms"
    );

    await vi.advanceTimersByTimeAsync(2000);
    await assertion;
  });
});
