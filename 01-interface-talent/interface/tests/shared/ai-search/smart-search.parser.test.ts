import { describe, expect, it, vi } from "vitest";

import {
  aiQueryToFilter,
  buildFilterQueryString,
  extractAiQuery,
  parseSmartSearch,
} from "@shared/ai-search/smart-search.parser";

describe("smart-search parser", () => {
  it("extrai campos combinando sinônimos e estruturas complexas", () => {
    const now = new Date("2024-05-15T10:00:00Z");
    const input =
      "Quero talento ativo em engenharia no ciclo 3 " +
      "curso de Logistica, na faculdade Alfa com pdi " +
      "sem líder nos últimos 7 dias para cargo de analista de dados ou product manager";

    const extracted = extractAiQuery(input, { now });

    expect(extracted).toEqual({
      current_cycle: 3,
      department: "Engineering",
      graduation_course: "de logistica",
      graduation_institution: "alfa",
      current_status: "ACTIVE",
      pdi_plan_ready: true,
      leader_null: true,
      date_updated_gte: "2024-05-08",
      target_role_names: ["analista de dados", "product manager"],
    });
  });

  it("resolve ids de cargos e constrói filtro/querystring consistentes", async () => {
    const resolver = vi.fn().mockResolvedValue([101, 202, 202, 333, NaN, Infinity]);
    const result = await parseSmartSearch("Talentos no ciclo 2 sem pdi para cargo de designer", {
      now: new Date("2024-05-20T00:00:00Z"),
      resolveTargetRoles: resolver,
    });

    expect(resolver).toHaveBeenCalledWith(["designer"]);

    expect(result.extracted).toMatchObject({
      current_cycle: 2,
      pdi_plan_ready: false,
      target_role_names: ["designer"],
    });
    expect(result.resolvedRoleIds).toEqual([101, 202, 333]);

    expect(result.filter).toEqual({
      current_cycle: { _eq: 2 },
      department: { _eq: "Design" },
      target_role_id: { _in: [101, 202, 333] },
      pdi_plan_ready: { _eq: false },
    });

    const params = new URLSearchParams(result.queryString.slice(1));
    expect(params.get("filter[current_cycle][_eq]")).toBe("2");
    expect(params.get("filter[department][_eq]")).toBe("Design");
    expect(params.get("filter[target_role_id][_in]")).toBe("101,202,333");
    expect(params.get("filter[pdi_plan_ready][_eq]")).toBe("false");
  });

  it("gera filtros vazios quando a query é vazia", () => {
    const extracted = extractAiQuery("");
    const filter = aiQueryToFilter(extracted);
    const queryString = buildFilterQueryString(filter);

    expect(extracted).toEqual({});
    expect(filter).toEqual({});
    expect(queryString).toBe("");
  });
});
