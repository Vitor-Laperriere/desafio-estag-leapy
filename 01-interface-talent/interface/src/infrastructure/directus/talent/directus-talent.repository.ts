import { env } from "@shared/config/env";
import { httpDelete, httpGet, httpPatch, httpPost } from "@shared/http/http-client";
import type {
  ITalentRepository,
  TalentCreatePayload,
  TalentUpdatePayload,
} from "@application/talent/ports/talent-repository.port";
import type { ListTalentsFilter } from "@application/talent/dto/list-talents-filter.dto";
import { InfrastructureError } from "@shared/errors";
import { mapDirectusTalent } from "./talent.mapper";
import { buildDirectusQuery, DEFAULT_FIELDS } from "./talent.query-builder";

const AUTH_HEADERS = {
  Authorization: `Bearer ${env.DIRECTUS_TOKEN}`,
} as const;

const fieldsQuery = new URLSearchParams({
  fields: DEFAULT_FIELDS,
}).toString();

type DirectusWritePayload = Record<string, unknown>;

function buildDirectusPayload(
  payload: TalentCreatePayload | TalentUpdatePayload
): DirectusWritePayload {
  const directus: DirectusWritePayload = {
    user_id: payload.userId,
    phone_number: payload.phoneNumber,
    verified_phone_number:
      payload.verifiedPhoneNumber === undefined
        ? undefined
        : payload.verifiedPhoneNumber,
    graduation_course: payload.graduationCourse,
    graduation_institution: payload.graduationInstitution,
    talent_current_skills:
      payload.currentSkills === undefined ? undefined : payload.currentSkills,
    target_role_id: payload.targetRoleId,
    leader_id: payload.leaderId,
    reset_count: payload.resetCount,
    current_cycle_id: payload.currentCycleId,
    current_cycle: payload.currentCycle,
    department: payload.department,
    current_status: payload.currentStatus,
    orchestrator_state: payload.orchestratorState,
    pdi_plan_ready: payload.pdiPlanReady,
    start_date: payload.startDate,
    end_date: payload.endDate,
    date_deleted: payload.dateDeleted,
    last_status_change_at: payload.lastStatusChangeAt,
    last_reset_at: payload.lastResetAt,
  };

  for (const key of Object.keys(directus)) {
    if (directus[key] === undefined) {
      delete directus[key];
    }
  }

  return directus;
}

export class DirectusTalentRepository implements ITalentRepository {
  async listTalents(p: ListTalentsFilter) {
    try {
      const qs = buildDirectusQuery(p);
      const url = `${env.DIRECTUS_URL}/items/talents?${qs}`;
      const res = await httpGet(url, {
        headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
        next: { revalidate: 5 },
      });
      const json = await res.json();
      return {
        data: (json.data ?? []).map(mapDirectusTalent),
        total: json?.meta?.filter_count ?? 0,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao listar talentos.";
      throw new InfrastructureError(message, { cause: error });
    }
  }

  async getTalent(id: string) {
    try {
      const url = `${env.DIRECTUS_URL}/items/talents/${id}?${fieldsQuery}`;
      const res = await fetch(url, {
        headers: AUTH_HEADERS,
        next: { revalidate: 0 },
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new InfrastructureError(`HTTP ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (!json?.data) return null;
      return mapDirectusTalent(json.data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      const message =
        error instanceof Error ? error.message : "Falha ao carregar talento.";
      throw new InfrastructureError(message, { cause: error });
    }
  }

  async createTalent(payload: TalentCreatePayload) {
    try {
      const url = `${env.DIRECTUS_URL}/items/talents?${fieldsQuery}`;
      const body = {
        data: {
          ...(payload.id ? { id: payload.id } : {}),
          ...buildDirectusPayload(payload),
        },
      };

      const res = await httpPost(url, body, {
        headers: AUTH_HEADERS,
        next: { revalidate: 0 },
      });

      const json = await res.json();
      return mapDirectusTalent(json.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao criar talento.";
      throw new InfrastructureError(message, { cause: error });
    }
  }

  async updateTalent(id: string, payload: TalentUpdatePayload) {
    try {
      const url = `${env.DIRECTUS_URL}/items/talents/${id}?${fieldsQuery}`;
      const body = { data: buildDirectusPayload(payload) };
      const res = await httpPatch(url, body, {
        headers: AUTH_HEADERS,
        next: { revalidate: 0 },
      });
      const json = await res.json();
      return mapDirectusTalent(json.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar talento.";
      throw new InfrastructureError(message, { cause: error });
    }
  }

  async deleteTalent(id: string) {
    try {
      const url = `${env.DIRECTUS_URL}/items/talents/${id}`;
      await httpDelete(url, undefined, {
        headers: AUTH_HEADERS,
        next: { revalidate: 0 },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao remover talento.";
      throw new InfrastructureError(message, { cause: error });
    }
  }
}
