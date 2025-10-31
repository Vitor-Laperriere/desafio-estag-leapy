import type { Talent } from "../../domain/entities";

export function mapDirectusTalent(row: any): Talent {
  return {
    id: row.id,
    userEmail: row?.user_id?.email ?? null,
    department: row.department ?? null,
    currentStatus: row.current_status ?? null,
    orchestratorState: row.orchestrator_state ?? null,
    pdiPlanReady: row.pdi_plan_ready ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    leader: row.leader_id
      ? { id: row.leader_id.id, position: row.leader_id.position, department: row.leader_id.department }
      : null,
    targetRole: row.target_role_id
      ? { id: row.target_role_id.id, name: row.target_role_id.name, description: row.target_role_id.description }
      : null,
  };
}