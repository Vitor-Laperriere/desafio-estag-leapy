import type { Talent } from "../../domain/entities";

type DirectusRelation<T> = T | null | undefined;

type DirectusTalentRow = {
  id: string;
  user_id?: DirectusRelation<{
    id?: string | null;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  }>;
  graduation_course?: string | null;
  graduation_institution?: string | null;
  talent_current_skills?: string | string[] | null;
  reset_count?: number | null;
  current_cycle_id?: string | null;
  current_cycle?: number | null;
  department?: string | null;
  current_status?: string | null;
  orchestrator_state?: string | null;
  pdi_plan_ready?: boolean | null;
  start_date?: string | null;
  end_date?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  date_deleted?: string | null;
  phone_number?: string | null;
  verified_phone_number?: string | null;
  last_status_change_at?: string | null;
  last_reset_at?: string | null;
  leader_id?: DirectusRelation<{
    id: number;
    position?: string | null;
    department?: string | null;
  }>;
  target_role_id?: DirectusRelation<{
    id: number;
    name: string;
    description?: string | null;
    date_created?: string | null;
    date_updated?: string | null;
    date_deleted?: string | null;
    important_skills?: unknown;
    success_criteria?: string | null;
    talent_id?: string | null;
    required_skills?: unknown;
    talent_current_skills?: unknown;
    match?: number | null;
  }>;
};

export function mapDirectusTalent(row: DirectusTalentRow): Talent {
  return {
    id: row.id,
    userId: row.user_id?.id ?? null,
    userFirstName: row.user_id?.first_name ?? null,
    userLastName: row.user_id?.last_name ?? null,
    userEmail: row.user_id?.email ?? null,
    phoneNumber: row.phone_number ?? null,
    verifiedPhoneNumber: row.verified_phone_number ?? null,
    graduationCourse: row.graduation_course ?? null,
    graduationInstitution: row.graduation_institution ?? null,
    currentSkills: row.talent_current_skills ?? null,
    targetRoleId:
      row.target_role_id && typeof row.target_role_id === "object"
        ? row.target_role_id.id
        : null,
    leaderId:
      row.leader_id && typeof row.leader_id === "object"
        ? row.leader_id.id
        : null,
    resetCount: row.reset_count ?? null,
    currentCycleId: row.current_cycle_id ?? null,
    currentCycle: row.current_cycle ?? null,
    department: row.department ?? null,
    currentStatus: row.current_status ?? null,
    orchestratorState: row.orchestrator_state ?? null,
    pdiPlanReady: row.pdi_plan_ready ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    dateCreated: row.date_created ?? null,
    dateUpdated: row.date_updated ?? null,
    dateDeleted: row.date_deleted ?? null,
    lastStatusChangeAt: row.last_status_change_at ?? null,
    lastResetAt: row.last_reset_at ?? null,
    leader: row.leader_id
      ? {
          id: row.leader_id.id,
          position: row.leader_id.position ?? null,
          department: row.leader_id.department ?? null,
        }
      : null,
    targetRole: row.target_role_id
      ? {
          id: row.target_role_id.id,
          name: row.target_role_id.name,
          description: row.target_role_id.description ?? null,
          dateCreated: row.target_role_id.date_created ?? null,
          dateUpdated: row.target_role_id.date_updated ?? null,
          dateDeleted: row.target_role_id.date_deleted ?? null,
          importantSkills: row.target_role_id.important_skills ?? null,
          successCriteria: row.target_role_id.success_criteria ?? null,
          talentId: row.target_role_id.talent_id ?? null,
          requiredSkills: row.target_role_id.required_skills ?? null,
          talentCurrentSkills: row.target_role_id.talent_current_skills ?? null,
          match: row.target_role_id.match ?? null,
        }
      : null,
  };
}
