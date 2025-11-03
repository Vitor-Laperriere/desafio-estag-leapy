import { z } from "zod";
import type {
  ITalentRepository,
  TalentCreatePayload,
} from "@application/talent/ports/talent-repository.port";
import { TalentWritableFieldsSchema } from "@application/talent/validation/talent-payload.schema";

const TalentCreateSchema = TalentWritableFieldsSchema.extend({
  id: z.string().trim().max(255).optional(),
  userId: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(1),
}) satisfies z.ZodType<TalentCreatePayload>;

export function makeCreateTalent(repo: ITalentRepository) {
  return async (raw: unknown) => {
    const payload = TalentCreateSchema.parse(raw);
    return repo.createTalent(payload);
  };
}
