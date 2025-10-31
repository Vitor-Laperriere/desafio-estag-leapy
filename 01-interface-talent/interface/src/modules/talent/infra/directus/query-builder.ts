import { ListTalentsFilter } from "../../domain/filters";

export function buildDirectusQuery(p: ListTalentsFilter): string {
  const qs: string[] = [];
  qs.push(
    `page=${p.page}`,
    `limit=${p.limit}`,
    `sort[]=${encodeURIComponent(p.sort)}`
  );
  qs.push(
    `fields=${encodeURIComponent(
      "*,user_id.email,leader_id.*,target_role_id.*"
    )}`
  );
  qs.push(`meta=filter_count`);
  if (p.q) qs.push(`search=${encodeURIComponent(p.q)}`);
  if (p.email)
    qs.push(
      `filter[user_id][email][_icontains]=${encodeURIComponent(p.email)}`
    );
  if (p.department)
    qs.push(`filter[department][_eq]=${encodeURIComponent(p.department)}`);
  if (p.orchestrator_state)
    qs.push(
      `filter[orchestrator_state][_eq]=${encodeURIComponent(
        p.orchestrator_state
      )}`
    );
  if (p.pdi_plan_ready)
    qs.push(`filter[pdi_plan_ready][_eq]=${p.pdi_plan_ready}`);
  if (p.start_date_from)
    qs.push(
      `filter[start_date][_gte]=${encodeURIComponent(p.start_date_from)}`
    );
  if (p.end_date_to)
    qs.push(`filter[end_date][_lte]=${encodeURIComponent(p.end_date_to)}`);
  if (p.leader_id)
    qs.push(`filter[leader_id][_eq]=${encodeURIComponent(p.leader_id)}`);
  if (p.target_role_id)
    qs.push(
      `filter[target_role_id][_eq]=${encodeURIComponent(p.target_role_id)}`
    );
  return qs.join("&");
}
