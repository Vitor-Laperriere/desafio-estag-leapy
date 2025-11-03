import { ListTalentsFilter } from "../../domain/filters";

const DEFAULT_FIELDS =
  "*,user_id.id,user_id.email,user_id.first_name,user_id.last_name,leader_id.*,target_role_id.*";

const buildFilterKey = (segments: string[], operator: string) =>
  `filter${segments.map((segment) => `[${segment}]`).join("")}[${operator}]`;

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : value.trim();
};

export function buildDirectusQuery(p: ListTalentsFilter): string {
  const params = new URLSearchParams();
  params.set("page", String(p.page));
  params.set("limit", String(p.limit));

  const sorts = p.sort && p.sort.length ? p.sort : ["-date_updated"];
  for (const s of sorts) params.append("sort[]", s);

  params.set("fields", DEFAULT_FIELDS);
  params.set("meta", "filter_count");

  const addFilter = (
    segments: string[],
    operator: string,
    value: string | number | boolean
  ) => {
    params.append(buildFilterKey(segments, operator), String(value));
  };

  const hasExplicitDateDeleted =
    p.dateDeletedIsNull !== undefined ||
    p.dateDeletedFrom !== undefined ||
    p.dateDeletedTo !== undefined;

  if (hasExplicitDateDeleted) {
    if (p.dateDeletedIsNull === false || p.dateDeletedFrom || p.dateDeletedTo) {
      addFilter(["date_deleted"], "_nnull", "true");
    } else {
      addFilter(["date_deleted"], "_null", "true");
    }
  } else if (!p.withDeleted) {
    addFilter(["date_deleted"], "_null", "true");
  }

  if (p.id) addFilter(["id"], "_eq", p.id);
  if (p.userId) addFilter(["user_id"], "_eq", p.userId);
  if (p.currentCycleId) addFilter(["current_cycle_id"], "_eq", p.currentCycleId);

  if (p.email) addFilter(["user_id", "email"], "_icontains", p.email);
  if (p.departments && p.departments.length) {
    addFilter(["department"], "_in", p.departments.join(","));
  } else if (p.department) {
    addFilter(["department"], "_eq", p.department);
  }
  if (p.missingOrchestrator) {
    addFilter(["orchestrator_state"], "_null", "true");
  } else if (p.orchestrators && p.orchestrators.length) {
    addFilter(["orchestrator_state"], "_in", p.orchestrators.join(","));
  } else if (p.orchestratorState) {
    addFilter(["orchestrator_state"], "_eq", p.orchestratorState);
  }
  if (p.pdiPlanReady !== undefined)
    addFilter(["pdi_plan_ready"], "_eq", p.pdiPlanReady ? "true" : "false");

  if (p.statuses && p.statuses.length) {
    addFilter(["current_status"], "_in", p.statuses.join(","));
  }

  if (p.phoneNumber) {
    addFilter(["phone_number"], "_icontains", normalizePhone(p.phoneNumber));
  }
  if (p.verifiedPhoneNumber) {
    addFilter(
      ["verified_phone_number"],
      "_icontains",
      normalizePhone(p.verifiedPhoneNumber)
    );
  }
  if (p.onlyVerifiedPhone !== undefined) {
    addFilter(
      ["verified_phone_number"],
      p.onlyVerifiedPhone ? "_nnull" : "_null",
      "true"
    );
  }

  if (p.leaders && p.leaders.length) {
    addFilter(["leader_id"], "_in", p.leaders.join(","));
  } else if (p.leaderId) {
    addFilter(["leader_id"], "_eq", p.leaderId);
  }
  if (p.missingLeader !== undefined) {
    addFilter(["leader_id"], p.missingLeader ? "_null" : "_nnull", "true");
  }
  if (p.roles && p.roles.length) {
    addFilter(["target_role_id"], "_in", p.roles.join(","));
  } else if (p.targetRoleId) {
    addFilter(["target_role_id"], "_eq", p.targetRoleId);
  }
  if (p.missingTargetRole !== undefined) {
    addFilter(
      ["target_role_id"],
      p.missingTargetRole ? "_null" : "_nnull",
      "true"
    );
  }

  if (p.graduationCourses && p.graduationCourses.length) {
    addFilter(["graduation_course"], "_in", p.graduationCourses.join(","));
  } else if (p.graduationCourse) {
    addFilter(["graduation_course"], "_icontains", p.graduationCourse);
  }
  if (p.graduationInstitutions && p.graduationInstitutions.length) {
    addFilter(["graduation_institution"], "_in", p.graduationInstitutions.join(","));
  } else if (p.graduationInstitution) {
    addFilter(["graduation_institution"], "_icontains", p.graduationInstitution);
  }

  if (p.currentCycleEq !== undefined) {
    addFilter(["current_cycle"], "_eq", p.currentCycleEq);
  }
  if (p.currentCycleMin !== undefined) {
    addFilter(["current_cycle"], "_gte", p.currentCycleMin);
  }
  if (p.currentCycleMax !== undefined) {
    addFilter(["current_cycle"], "_lte", p.currentCycleMax);
  }

  if (p.resetCountMin !== undefined) {
    addFilter(["reset_count"], "_gte", p.resetCountMin);
  }
  if (p.resetCountMax !== undefined) {
    addFilter(["reset_count"], "_lte", p.resetCountMax);
  }

  if (p.dateCreatedFrom) addFilter(["date_created"], "_gte", p.dateCreatedFrom);
  if (p.dateCreatedTo) addFilter(["date_created"], "_lte", p.dateCreatedTo);
  if (p.dateUpdatedFrom) addFilter(["date_updated"], "_gte", p.dateUpdatedFrom);
  if (p.dateUpdatedTo) addFilter(["date_updated"], "_lte", p.dateUpdatedTo);
  if (p.lastStatusChangeFrom) {
    addFilter(["last_status_change_at"], "_gte", p.lastStatusChangeFrom);
  }
  if (p.lastStatusChangeTo) {
    addFilter(["last_status_change_at"], "_lte", p.lastStatusChangeTo);
  }
  if (p.lastResetFrom) addFilter(["last_reset_at"], "_gte", p.lastResetFrom);
  if (p.lastResetTo) addFilter(["last_reset_at"], "_lte", p.lastResetTo);

  if (p.dateDeletedFrom) addFilter(["date_deleted"], "_gte", p.dateDeletedFrom);
  if (p.dateDeletedTo) addFilter(["date_deleted"], "_lte", p.dateDeletedTo);

  if (p.startDateFrom) addFilter(["start_date"], "_gte", p.startDateFrom);
  if (p.startDateTo) addFilter(["start_date"], "_lte", p.startDateTo);
  if (p.endDateFrom) addFilter(["end_date"], "_gte", p.endDateFrom);
  if (p.endDateTo) addFilter(["end_date"], "_lte", p.endDateTo);

  if (p.activeFrom) addFilter(["end_date"], "_gte", p.activeFrom);
  if (p.activeTo) addFilter(["start_date"], "_lte", p.activeTo);

  if (p.q) {
    const targets = [
      ["department"],
      ["graduation_course"],
      ["graduation_institution"],
      ["target_role_id", "name"],
      ["leader_id", "position"],
    ];
    targets.forEach((segments, index) => {
      addFilter(["_or", String(index), ...segments], "_icontains", p.q as string);
    });
  }

  return params.toString();
}
