import type { ITalentRepository } from "../../domain/repo";

export function makeDeleteTalent(repo: ITalentRepository) {
  return async (id: string) => {
    const normalized = id?.trim();
    if (!normalized) {
      throw new Error("O identificador do talento é obrigatório.");
    }
    await repo.deleteTalent(normalized);
  };
}
