import { z } from "zod";

const nullableString = z.union([z.string(), z.null()]);
const nullableNumber = z.union([z.number(), z.null()]);
const nullableBoolean = z.union([z.boolean(), z.null()]);

export const TalentWritableFieldsSchema = z.object({
  verifiedPhoneNumber: nullableString.optional(),
  graduationCourse: nullableString.optional(),
  graduationInstitution: nullableString.optional(),
  currentSkills: z.unknown().optional(),
  targetRoleId: nullableNumber.optional(),
  leaderId: nullableNumber.optional(),
  resetCount: nullableNumber.optional(),
  currentCycleId: nullableString.optional(),
  currentCycle: nullableNumber.optional(),
  department: nullableString.optional(),
  currentStatus: nullableString.optional(),
  orchestratorState: nullableString.optional(),
  pdiPlanReady: nullableBoolean.optional(),
  startDate: nullableString.optional(),
  endDate: nullableString.optional(),
  dateDeleted: nullableString.optional(),
  lastStatusChangeAt: nullableString.optional(),
  lastResetAt: nullableString.optional(),
});
