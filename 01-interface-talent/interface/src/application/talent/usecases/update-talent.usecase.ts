import { z } from "zod";
import type {
  ITalentRepository,
  TalentUpdatePayload,
} from "@application/talent/ports/talent-repository.port";
import { TalentWritableFieldsSchema } from "@application/talent/validation/talent-payload.schema";
import { ValidationError } from "@shared/errors";

const TalentUpdateSchema = TalentWritableFieldsSchema.extend({
  userId: z.string().trim().min(1).optional(),
  phoneNumber: z.string().trim().min(1).optional(),
}) satisfies z.ZodType<TalentUpdatePayload>;

export function makeUpdateTalent(repo: ITalentRepository) {
  return async (id: string, raw: unknown) => {
    if (!id?.trim()) {
      throw new ValidationError("O identificador do talento é obrigatório.");
    }
    const payload = TalentUpdateSchema.parse(raw);
    return repo.updateTalent(id, payload);
  };
}
