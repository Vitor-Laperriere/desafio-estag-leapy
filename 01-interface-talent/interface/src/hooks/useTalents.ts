// src/hooks/useTalents.ts
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";

export type Talent = {
  id: string;
  department: string | null;
  current_status: string | null;
  orchestrator_state: string | null;
  pdi_plan_ready: boolean | null;
  start_date: string | null;
  end_date: string | null;
  user_id?: { email?: string };
  leader_id?: {
    id: number;
    department: string | null;
    position: string | null;
  };
  target_role_id?: { id: number; name: string; description: string | null };
};

export type TalentsResponse = {
  data: Talent[];
  meta: { filter_count?: number };
  error?: string;
  detail?: string;
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

export function useTalents(params: {
  page: number;
  limit: number;
  email?: string; // JOIN user_id.email
  q?: string; // search geral
  department?: string;
  orchestrator_state?: string;
  pdi_plan_ready?: string; // "true" | "false" | ""
  id?: string;
  user_id?: string;
  phone_number?: string;
  graduation_course?: string;
  graduation_institution?: string;
  current_status?: string;
  verified_phone_number?: string;
  target_role_id?: string;
  leader_id?: string;
  reset_count_min?: string;
  reset_count_max?: string;
  current_cycle?: string;
  current_cycle_min?: string;
  current_cycle_max?: string;
  current_cycle_id?: string;

  date_created_from?: string;
  date_created_to?: string;
  date_updated_from?: string;
  date_updated_to?: string;
  date_deleted_from?: string;
  date_deleted_to?: string;
  date_deleted_is_null?: string; // "true"/"false"
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  last_status_change_from?: string;
  last_status_change_to?: string;
  last_reset_from?: string;
  last_reset_to?: string;
}) {
  const debouncedEmail = useDebouncedValue(params.email ?? "", 400);
  const debouncedQ = useDebouncedValue(params.q ?? "", 400);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set("page", String(params.page));
    q.set("limit", String(params.limit));
    q.set("sort", "-date_updated");
    if (debouncedEmail) q.set("email", debouncedEmail);
    if (debouncedQ) q.set("q", debouncedQ);
    if (params.department) q.set("department", params.department);
    if (params.orchestrator_state)
      q.set("orchestrator_state", params.orchestrator_state);
    if (params.pdi_plan_ready) q.set("pdi_plan_ready", params.pdi_plan_ready);
    if (params.id) q.set("id", params.id);
    if (params.user_id) q.set("user_id", params.user_id);
    if (params.phone_number) q.set("phone_number", params.phone_number);
    if (params.graduation_course)
      q.set("graduation_course", params.graduation_course);
    if (params.graduation_institution)
      q.set("graduation_institution", params.graduation_institution);
    if (params.current_status) q.set("current_status", params.current_status);
    if (params.verified_phone_number)
      q.set("verified_phone_number", params.verified_phone_number);
    if (params.leader_id) q.set("leader_id", params.leader_id);
    if (params.target_role_id) q.set("target_role_id", params.target_role_id);
    if (params.current_cycle) q.set("current_cycle", params.current_cycle);
    if (params.current_cycle_min)
      q.set("current_cycle_min", params.current_cycle_min);
    if (params.current_cycle_max)
      q.set("current_cycle_max", params.current_cycle_max);
    if (params.current_cycle_id)
      q.set("current_cycle_id", params.current_cycle_id);
    if (params.reset_count_min)
      q.set("reset_count_min", params.reset_count_min);
    if (params.reset_count_max)
      q.set("reset_count_max", params.reset_count_max);

    // ranges de datas
    const set2 = (k: string, v?: string) => {
      if (v) q.set(k, v);
    };
    set2("date_created_from", params.date_created_from);
    set2("date_created_to", params.date_created_to);
    set2("date_updated_from", params.date_updated_from);
    set2("date_updated_to", params.date_updated_to);
    set2("date_deleted_from", params.date_deleted_from);
    set2("date_deleted_to", params.date_deleted_to);
    if (params.date_deleted_is_null)
      q.set("date_deleted_is_null", params.date_deleted_is_null);
    set2("start_date_from", params.start_date_from);
    set2("start_date_to", params.start_date_to);
    set2("end_date_from", params.end_date_from);
    set2("end_date_to", params.end_date_to);
    set2("last_status_change_from", params.last_status_change_from);
    set2("last_status_change_to", params.last_status_change_to);
    set2("last_reset_from", params.last_reset_from);
    set2("last_reset_to", params.last_reset_to);
    if (params.leader_id) q.set("leader_id", params.leader_id);
    if (params.target_role_id) q.set("target_role_id", params.target_role_id);
    return q.toString();
  }, [
    params.page,
    params.limit,
    debouncedEmail,
    debouncedQ,
    params.department,
    params.orchestrator_state,
    params.pdi_plan_ready,
    params.id,
    params.user_id,
    params.phone_number,
    params.graduation_course,
    params.graduation_institution,
    params.current_status,
    params.verified_phone_number,
    params.leader_id,
    params.target_role_id,
    params.reset_count_min,
    params.reset_count_max,
    params.current_cycle,
    params.current_cycle_min,
    params.current_cycle_max,
    params.current_cycle_id,
    params.date_created_from,
    params.date_created_to,
    params.date_updated_from,
    params.date_updated_to,
    params.date_deleted_from,
    params.date_deleted_to,
    params.date_deleted_is_null,
    params.start_date_from,
    params.start_date_to,
    params.end_date_from,
    params.end_date_to,
    params.last_status_change_from,
    params.last_status_change_to,
    params.last_reset_from,
    params.last_reset_to,
    params.leader_id,
    params.target_role_id,
  ]);

  const { data, error, isLoading } = useSWR<TalentsResponse>(
    `/api/talents?${query}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 500,
    }
  );

  return {
    talents: data?.data ?? [],
    total: data?.meta?.filter_count ?? 0,
    isLoading,
    isError: !!error,
    errorDetail: error?.message ?? data?.error ?? "",
  };
}
