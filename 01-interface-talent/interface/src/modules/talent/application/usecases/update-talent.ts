import { z } from "zod";
import type {
  ITalentRepository,
  TalentUpdatePayload,
} from "../../domain/repo";
import { TalentWritableFieldsSchema } from "./talent-payload-schema";

const TalentUpdateSchema = TalentWritableFieldsSchema.extend({
  userId: z.string().trim().min(1).optional(),
  phoneNumber: z.string().trim().min(1).optional(),
}) satisfies z.ZodType<TalentUpdatePayload>;

export function makeUpdateTalent(repo: ITalentRepository) {
  return async (id: string, raw: unknown) => {
    if (!id?.trim()) {
      throw new Error("O identificador do talento é obrigatório.");
    }
    const payload = TalentUpdateSchema.parse(raw);
    return repo.updateTalent(id, payload);
  };
}
