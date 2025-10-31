import type { Talent } from "../../domain/entities";

type DirectusRelation<T> = T | null | undefined;

type DirectusTalentRow = {
  id: string;
  user_id?: DirectusRelation<{ email?: string | null }>;
  department?: string | null;
  current_status?: string | null;
  orchestrator_state?: string | null;
  pdi_plan_ready?: boolean | null;
  start_date?: string | null;
  end_date?: string | null;
  leader_id?: DirectusRelation<{
    id: number;
    position?: string | null;
    department?: string | null;
  }>;
  target_role_id?: DirectusRelation<{
    id: number;
    name: string;
    description?: string | null;
  }>;
};

export function mapDirectusTalent(row: DirectusTalentRow): Talent {
  return {
    id: row.id,
    userEmail: row.user_id?.email ?? null,
    department: row.department ?? null,
    currentStatus: row.current_status ?? null,
    orchestratorState: row.orchestrator_state ?? null,
    pdiPlanReady: row.pdi_plan_ready ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
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
        }
      : null,
  };
}
