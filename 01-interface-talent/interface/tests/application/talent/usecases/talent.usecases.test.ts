import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { ValidationError } from "@shared/errors";

import { makeCreateTalent } from "@application/talent/usecases/create-talent.usecase";
import { makeDeleteTalent } from "@application/talent/usecases/delete-talent.usecase";
import { makeGetTalent } from "@application/talent/usecases/get-talent.usecase";
import { makeListTalents } from "@application/talent/usecases/list-talents.usecase";
import { createSmartSearchUseCase } from "@application/talent/usecases/smart-search.usecase";
import { makeUpdateTalent } from "@application/talent/usecases/update-talent.usecase";

describe("Talent use cases", () => {
  it("createTalent valida payload e delega para repositório", async () => {
    const repo = {
      createTalent: vi.fn().mockResolvedValue({ id: "talent-1" }),
    };
    const createTalent = makeCreateTalent(repo);

    const payload = {
      userId: " user-1 ",
      phoneNumber: " 5511999999999 ",
      targetRoleId: 10,
      pdiPlanReady: true,
    };

    await expect(createTalent(payload)).resolves.toEqual({ id: "talent-1" });

    expect(repo.createTalent).toHaveBeenCalledWith({
      userId: "user-1",
      phoneNumber: "5511999999999",
      targetRoleId: 10,
      pdiPlanReady: true,
    });
  });

  it("createTalent lança zod error quando obrigatório ausente", async () => {
    const repo = { createTalent: vi.fn() };
    const createTalent = makeCreateTalent(repo as never);

    await expect(createTalent({})).rejects.toBeInstanceOf(ZodError);
    expect(repo.createTalent).not.toHaveBeenCalled();
  });

  it("updateTalent valida id e normaliza campos opcionais", async () => {
    const repo = {
      updateTalent: vi.fn().mockResolvedValue({ id: "talent-1" }),
    };
    const updateTalent = makeUpdateTalent(repo);

    await expect(
      updateTalent(" talent-1 ", { userId: " user-2 ", phoneNumber: " 55118 " })
    ).resolves.toEqual({ id: "talent-1" });

    expect(repo.updateTalent).toHaveBeenCalledWith(" talent-1 ", {
      userId: "user-2",
      phoneNumber: "55118",
    });
  });

  it("updateTalent rejeita id vazio e payload inválido", async () => {
    const repo = { updateTalent: vi.fn() };
    const updateTalent = makeUpdateTalent(repo as never);

    await expect(updateTalent("   ", {})).rejects.toBeInstanceOf(ValidationError);
    await expect(
      updateTalent("id", { userId: "   " })
    ).rejects.toBeInstanceOf(ZodError);
  });

  it("getTalent normaliza id e aciona repositório", async () => {
    const repo = {
      getTalent: vi.fn().mockResolvedValue({ id: "talent-1" }),
    };
    const getTalent = makeGetTalent(repo);

    await expect(getTalent(" talent-1 ")).resolves.toEqual({ id: "talent-1" });
    expect(repo.getTalent).toHaveBeenCalledWith("talent-1");
  });

  it("getTalent lança ValidationError para id vazio", async () => {
    const repo = { getTalent: vi.fn() };
    const getTalent = makeGetTalent(repo as never);

    await expect(getTalent("   ")).rejects.toBeInstanceOf(ValidationError);
  });

  it("deleteTalent normaliza id e invoca repositório", async () => {
    const repo = { deleteTalent: vi.fn().mockResolvedValue(undefined) };
    const deleteTalent = makeDeleteTalent(repo);

    await expect(deleteTalent(" talent-1 ")).resolves.toBeUndefined();
    expect(repo.deleteTalent).toHaveBeenCalledWith("talent-1");
  });

  it("deleteTalent lança ValidationError para id vazio", async () => {
    const repo = { deleteTalent: vi.fn() };
    const deleteTalent = makeDeleteTalent(repo as never);

    await expect(deleteTalent("")).rejects.toBeInstanceOf(ValidationError);
  });

  it("listTalents parseia filtros crus antes de delegar", async () => {
    const repo = {
      listTalents: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    };
    const listTalents = makeListTalents(repo);

    await expect(
      listTalents({ page: "2", limit: "5", department: "Engineering" })
    ).resolves.toEqual({ data: [], total: 0 });

    expect(repo.listTalents).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 5,
        department: "Engineering",
        sort: ["-date_updated"],
      })
    );
  });

  it("smartSearch usa roleRepository para resolver ids", async () => {
    const roleRepository = {
      findIdsByNames: vi.fn().mockResolvedValue([5, 5, 8]),
    };
    const useCase = createSmartSearchUseCase({ roleRepository });

    const result = await useCase.execute("Talentos para cargo de designer");

    expect(roleRepository.findIdsByNames).toHaveBeenCalledWith(["designer"]);
    expect(result.resolvedRoleIds).toEqual([5, 8]);
    expect(result.filter.target_role_id?._in).toEqual([5, 8]);
  });
});
