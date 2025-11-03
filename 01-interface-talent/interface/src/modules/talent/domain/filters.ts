import { z } from "zod";

type StringRecord = Record<string, unknown>;

const RawListTalentsFilter = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    q: z.string().optional(),
    department: z.string().optional(),
    departments: z.string().optional(),
    orchestrator: z.string().optional(),
    orchestrators: z.string().optional(),
    orchestrator_null: z.string().optional(),
    pdi: z.string().optional(),
    status: z.string().optional(),
    id: z.string().optional(),
    userId: z.string().optional(),
    currentCycleId: z.string().optional(),
    phone: z.string().optional(),
    verifiedPhone: z.string().optional(),
    onlyVerifiedPhone: z.string().optional(),
    leaderId: z.string().optional(),
    leaders: z.string().optional(),
    roleId: z.string().optional(),
    roles: z.string().optional(),
    noLeader: z.string().optional(),
    noRole: z.string().optional(),
    resetCountMin: z.string().optional(),
    resetCountMax: z.string().optional(),
    currentCycle: z.string().optional(),
    currentCycleMin: z.string().optional(),
    currentCycleMax: z.string().optional(),
    graduationCourse: z.string().optional(),
    graduationCourses: z.string().optional(),
    graduationInstitution: z.string().optional(),
    graduationInstitutions: z.string().optional(),
    startFrom: z.string().optional(),
    startTo: z.string().optional(),
    endFrom: z.string().optional(),
    endTo: z.string().optional(),
    activeFrom: z.string().optional(),
    activeTo: z.string().optional(),
    dateCreatedFrom: z.string().optional(),
    dateCreatedTo: z.string().optional(),
    dateUpdatedFrom: z.string().optional(),
    dateUpdatedTo: z.string().optional(),
    lastStatusChangeFrom: z.string().optional(),
    lastStatusChangeTo: z.string().optional(),
    lastResetFrom: z.string().optional(),
    lastResetTo: z.string().optional(),
    withDeleted: z.string().optional(),
    dateDeletedFrom: z.string().optional(),
    dateDeletedTo: z.string().optional(),
    dateDeletedIsNull: z.string().optional(),
    orchestrator_state: z.string().optional(),
    pdi_plan_ready: z.string().optional(),
    department_eq: z.string().optional(),
    email_search: z.string().optional(),
    leader_id: z.string().optional(),
    target_role_id: z.string().optional(),
    phone_number: z.string().optional(),
    verified_phone_number: z.string().optional(),
    start_date_from: z.string().optional(),
    start_date_to: z.string().optional(),
    end_date_from: z.string().optional(),
    end_date_to: z.string().optional(),
    reset_count_min: z.string().optional(),
    reset_count_max: z.string().optional(),
    current_cycle: z.string().optional(),
    current_cycle_min: z.string().optional(),
    current_cycle_max: z.string().optional(),
    current_cycle_id: z.string().optional(),
    last_status_change_from: z.string().optional(),
    last_status_change_to: z.string().optional(),
    last_reset_from: z.string().optional(),
    last_reset_to: z.string().optional(),
    date_created_from: z.string().optional(),
    date_created_to: z.string().optional(),
    date_updated_from: z.string().optional(),
    date_updated_to: z.string().optional(),
    date_deleted_is_null: z.string().optional(),
    verified_only: z.string().optional(),
    leader_is_null: z.string().optional(),
    target_role_is_null: z.string().optional(),
  })
  .passthrough()
  .transform((raw) => {
    const source = raw as StringRecord;

    const pickString = (...keys: string[]) => {
      for (const key of keys) {
        const value = source[key];
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed.length) return trimmed;
        }
      }
      return undefined;
    };

    const pickBoolean = (...keys: string[]) => {
      for (const key of keys) {
        const value = source[key];
        if (typeof value === "string") {
          const normalized = value.trim().toLowerCase();
          if (normalized === "true") return true;
          if (normalized === "false") return false;
        }
      }
      return undefined;
    };

    const pickNumber = (...keys: string[]) => {
      for (const key of keys) {
        const value = pickString(key);
        if (value !== undefined && value !== "") {
          const n = Number(value);
          if (!Number.isNaN(n)) return n;
        }
      }
      return undefined;
    };

    const pickCsv = (...keys: string[]) => {
      const value = pickString(...keys);
      if (!value) return undefined;
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return parts.length ? parts : undefined;
    };

    const sortString = pickString("sort");
    const sort = sortString
      ? sortString
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const dateDeletedIsNull =
      pickBoolean("dateDeletedIsNull", "date_deleted_is_null");

    return {
      page: raw.page,
      limit: raw.limit,
      sort: sort && sort.length ? sort : ["-date_updated"],
      email: pickString("email", "email_search"),
      q: pickString("q"),
      department: pickString("department", "department_eq"),
      departments: pickCsv("departments"),
      orchestratorState: pickString("orchestrator", "orchestrator_state"),
      orchestrators: pickCsv("orchestrators"),
      missingOrchestrator: pickBoolean("orchestrator_null"),
      pdiPlanReady: pickBoolean("pdi", "pdi_plan_ready"),
      statuses: pickCsv("status", "current_status"),
      id: pickString("id"),
      userId: pickString("userId", "user_id"),
      currentCycleId: pickString("currentCycleId", "current_cycle_id"),
      phoneNumber: pickString("phone", "phone_number"),
      verifiedPhoneNumber: pickString(
        "verifiedPhone",
        "verified_phone_number"
      ),
      onlyVerifiedPhone: pickBoolean("onlyVerifiedPhone", "verified_only"),
      leaderId: pickString("leaderId", "leader_id"),
      leaders: pickCsv("leaders"),
      targetRoleId: pickString("roleId", "target_role_id"),
      roles: pickCsv("roles"),
      missingLeader: pickBoolean("noLeader", "leader_is_null"),
      missingTargetRole: pickBoolean("noRole", "target_role_is_null"),
      matchMin: pickNumber("matchMin"),
      resetCountMin: pickNumber("resetCountMin", "reset_count_min"),
      resetCountMax: pickNumber("resetCountMax", "reset_count_max"),
      currentCycleEq: pickNumber("currentCycle", "current_cycle"),
      currentCycleMin: pickNumber("currentCycleMin", "current_cycle_min"),
      currentCycleMax: pickNumber("currentCycleMax", "current_cycle_max"),
      graduationCourse: pickString("graduationCourse", "graduation_course"),
      graduationCourses: pickCsv("graduationCourses"),
      graduationInstitution: pickString(
        "graduationInstitution",
        "graduation_institution"
      ),
      graduationInstitutions: pickCsv("graduationInstitutions"),
      startDateFrom: pickString("startFrom", "start_date_from"),
      startDateTo: pickString("startTo", "start_date_to"),
      endDateFrom: pickString("endFrom", "end_date_from"),
      endDateTo: pickString("endTo", "end_date_to"),
      activeFrom: pickString("activeFrom"),
      activeTo: pickString("activeTo"),
      dateCreatedFrom: pickString("dateCreatedFrom", "date_created_from"),
      dateCreatedTo: pickString("dateCreatedTo", "date_created_to"),
      dateUpdatedFrom: pickString("dateUpdatedFrom", "date_updated_from"),
      dateUpdatedTo: pickString("dateUpdatedTo", "date_updated_to"),
      lastStatusChangeFrom: pickString(
        "lastStatusChangeFrom",
        "last_status_change_from"
      ),
      lastStatusChangeTo: pickString(
        "lastStatusChangeTo",
        "last_status_change_to"
      ),
      lastResetFrom: pickString("lastResetFrom", "last_reset_from"),
      lastResetTo: pickString("lastResetTo", "last_reset_to"),
      withDeleted: pickBoolean("withDeleted"),
      dateDeletedFrom: pickString("dateDeletedFrom", "date_deleted_from"),
      dateDeletedTo: pickString("dateDeletedTo", "date_deleted_to"),
      dateDeletedIsNull,
    };
  });

export const ListTalentsFilter = RawListTalentsFilter;
export type ListTalentsFilter = z.infer<typeof RawListTalentsFilter>;
