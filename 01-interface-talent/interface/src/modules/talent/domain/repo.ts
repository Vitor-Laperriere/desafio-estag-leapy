import type { Talent } from "./entities";
import type { ListTalentsFilter } from "./filters";

export type TalentCreatePayload = {
  id?: string;
  userId: string;
  phoneNumber: string;
  verifiedPhoneNumber?: string | null;
  graduationCourse?: string | null;
  graduationInstitution?: string | null;
  currentSkills?: unknown;
  targetRoleId?: number | null;
  leaderId?: number | null;
  resetCount?: number | null;
  currentCycleId?: string | null;
  currentCycle?: number | null;
  department?: string | null;
  currentStatus?: string | null;
  orchestratorState?: string | null;
  pdiPlanReady?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  dateDeleted?: string | null;
  lastStatusChangeAt?: string | null;
  lastResetAt?: string | null;
};

export type TalentUpdatePayload = Partial<
  Omit<TalentCreatePayload, "userId" | "phoneNumber">
> & {
  userId?: string;
  phoneNumber?: string;
};

export interface ITalentRepository {
  listTalents(
    filter: ListTalentsFilter
  ): Promise<{ data: Talent[]; total: number }>;
  getTalent(id: string): Promise<Talent | null>;
  createTalent(payload: TalentCreatePayload): Promise<Talent>;
  updateTalent(id: string, payload: TalentUpdatePayload): Promise<Talent>;
  deleteTalent(id: string): Promise<void>;
}
