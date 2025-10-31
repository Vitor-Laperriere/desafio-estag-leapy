// src/hooks/useTalents.ts
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

export type Talent = {
  id: string;
  userEmail?: string | null;
  department?: string | null;
  currentStatus?: string | null;
  orchestratorState?: string | null;
  pdiPlanReady?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  leader?: { id: number; department?: string | null; position?: string | null } | null;
  targetRole?: { id: number; name: string; description?: string | null } | null;
};

export type TalentsResponse = {
  data: Talent[];
  meta: { filter_count?: number };
  error?: string;
  detail?: string;
};

export type TalentsQueryParams = {
  page: number;
  limit: number;
  sort?: string;
  email?: string;
  q?: string;
  department?: string;
  orchestrator?: string;
  pdi?: string;
  status?: string;
  id?: string;
  userId?: string;
  currentCycleId?: string;
  phone?: string;
  verifiedPhone?: string;
  onlyVerifiedPhone?: boolean;
  leaderId?: string;
  roleId?: string;
  noLeader?: boolean;
  noRole?: boolean;
  resetCountMin?: string;
  resetCountMax?: string;
  currentCycle?: string;
  currentCycleMin?: string;
  currentCycleMax?: string;
  graduationCourse?: string;
  graduationInstitution?: string;
  startFrom?: string;
  startTo?: string;
  endFrom?: string;
  endTo?: string;
  activeFrom?: string;
  activeTo?: string;
  dateCreatedFrom?: string;
  dateCreatedTo?: string;
  dateUpdatedFrom?: string;
  dateUpdatedTo?: string;
  lastStatusChangeFrom?: string;
  lastStatusChangeTo?: string;
  lastResetFrom?: string;
  lastResetTo?: string;
  dateDeletedFrom?: string;
  dateDeletedTo?: string;
  dateDeletedIsNull?: string;
  withDeleted?: boolean;
};

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(text || `HTTP ${r.status}`);
  }
  return r.json();
};

export function useDebouncedValue<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function useTalents(params: TalentsQueryParams) {
  const debouncedEmail = useDebouncedValue(params.email ?? "", 400);
  const debouncedQ = useDebouncedValue(params.q ?? "", 400);

  const query = useMemo(() => {
    const search = new URLSearchParams();
    const setString = (key: string, value?: string | null | undefined) => {
      if (!value) return;
      const trimmed = value.trim();
      if (trimmed) search.set(key, trimmed);
    };
    const setBoolean = (key: string, value?: boolean) => {
      if (value === undefined) return;
      search.set(key, value ? "true" : "false");
    };

    search.set("page", String(params.page));
    search.set("limit", String(params.limit));
    setString("sort", params.sort ?? "-date_updated");

    if (debouncedEmail) setString("email", debouncedEmail);
    if (debouncedQ) setString("q", debouncedQ);

    setString("department", params.department);
    setString("orchestrator", params.orchestrator);
    setString("pdi", params.pdi);
    setString("status", params.status);
    setString("id", params.id);
    setString("userId", params.userId);
    setString("currentCycleId", params.currentCycleId);
    setString("phone", params.phone);
    setString("verifiedPhone", params.verifiedPhone);
    setBoolean("onlyVerifiedPhone", params.onlyVerifiedPhone);
    setString("leaderId", params.leaderId);
    setString("roleId", params.roleId);
    setBoolean("noLeader", params.noLeader);
    setBoolean("noRole", params.noRole);
    setString("resetCountMin", params.resetCountMin);
    setString("resetCountMax", params.resetCountMax);
    setString("currentCycle", params.currentCycle);
    setString("currentCycleMin", params.currentCycleMin);
    setString("currentCycleMax", params.currentCycleMax);
    setString("graduationCourse", params.graduationCourse);
    setString("graduationInstitution", params.graduationInstitution);
    setString("startFrom", params.startFrom);
    setString("startTo", params.startTo);
    setString("endFrom", params.endFrom);
    setString("endTo", params.endTo);
    setString("activeFrom", params.activeFrom);
    setString("activeTo", params.activeTo);
    setString("dateCreatedFrom", params.dateCreatedFrom);
    setString("dateCreatedTo", params.dateCreatedTo);
    setString("dateUpdatedFrom", params.dateUpdatedFrom);
    setString("dateUpdatedTo", params.dateUpdatedTo);
    setString("lastStatusChangeFrom", params.lastStatusChangeFrom);
    setString("lastStatusChangeTo", params.lastStatusChangeTo);
    setString("lastResetFrom", params.lastResetFrom);
    setString("lastResetTo", params.lastResetTo);
    setString("dateDeletedFrom", params.dateDeletedFrom);
    setString("dateDeletedTo", params.dateDeletedTo);
    setString("dateDeletedIsNull", params.dateDeletedIsNull);
    setBoolean("withDeleted", params.withDeleted);

    return search.toString();
  }, [
    params.page,
    params.limit,
    params.sort,
    debouncedEmail,
    debouncedQ,
    params.department,
    params.orchestrator,
    params.pdi,
    params.status,
    params.id,
    params.userId,
    params.currentCycleId,
    params.phone,
    params.verifiedPhone,
    params.onlyVerifiedPhone,
    params.leaderId,
    params.roleId,
    params.noLeader,
    params.noRole,
    params.resetCountMin,
    params.resetCountMax,
    params.currentCycle,
    params.currentCycleMin,
    params.currentCycleMax,
    params.graduationCourse,
    params.graduationInstitution,
    params.startFrom,
    params.startTo,
    params.endFrom,
    params.endTo,
    params.activeFrom,
    params.activeTo,
    params.dateCreatedFrom,
    params.dateCreatedTo,
    params.dateUpdatedFrom,
    params.dateUpdatedTo,
    params.lastStatusChangeFrom,
    params.lastStatusChangeTo,
    params.lastResetFrom,
    params.lastResetTo,
    params.dateDeletedFrom,
    params.dateDeletedTo,
    params.dateDeletedIsNull,
    params.withDeleted,
  ]);

  const { data, error, isLoading } = useSWR<TalentsResponse>(
    `/api/talents?${query}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 500 }
  );

  return {
    talents: data?.data ?? [],
    total: data?.meta?.filter_count ?? 0,
    isLoading,
    isError: !!error,
    errorDetail: error?.message ?? data?.error ?? "",
  };
}
