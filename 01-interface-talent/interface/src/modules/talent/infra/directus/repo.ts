import { env } from "@/core/env";
import { httpGet } from "@/core/http/fetch";
import type { ITalentRepository } from "../../domain/repo";
import type { ListTalentsFilter } from "../../domain/filters";
import { buildDirectusQuery } from "./query-builder";
import { mapDirectusTalent } from "./mapper";

export class DirectusTalentRepository implements ITalentRepository {
  async listTalents(p: ListTalentsFilter) {
    const qs = buildDirectusQuery(p);
    const url = `${env.DIRECTUS_URL}/items/talents?${qs}`;
    const res = await httpGet(url, {
      headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
      // cache/control conforme Next docs:
      next: { revalidate: 5 },
    });
    const json = await res.json();
    return {
      data: (json.data ?? []).map(mapDirectusTalent),
      total: json?.meta?.filter_count ?? 0,
    };
  }
}