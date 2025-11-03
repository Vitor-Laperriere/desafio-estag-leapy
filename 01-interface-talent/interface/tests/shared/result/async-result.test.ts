import { describe, expect, it } from "vitest";

import { ApplicationError } from "@shared/errors";

import { toResult } from "@shared/result/async-result";

describe("toResult", () => {
  it("retorna resultado ok quando a promise resolve", async () => {
    const result = await toResult(async () => "talent-1");

    expect(result.ok).toBe(true);
    expect(result).toEqual({ ok: true, value: "talent-1" });
  });

  it("normaliza rejeições para instâncias de Error", async () => {
    const result = await toResult(async () => {
      throw "falha inesperada";
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toBe("Erro inesperado");
    expect((result.error as ApplicationError).cause).toBe("falha inesperada");
  });
});
