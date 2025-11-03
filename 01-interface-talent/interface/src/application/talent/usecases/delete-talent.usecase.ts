import type { ITalentRepository } from "@application/talent/ports/talent-repository.port";
import { ValidationError } from "@shared/errors";

export function makeDeleteTalent(repo: ITalentRepository) {
  return async (id: string) => {
    const normalized = id?.trim();
    if (!normalized) {
      throw new ValidationError("O identificador do talento é obrigatório.");
    }
    await repo.deleteTalent(normalized);
  };
}
