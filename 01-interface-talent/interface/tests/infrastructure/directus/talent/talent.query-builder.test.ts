import { describe, expect, it } from "vitest";

import { ListTalentsFilter } from "@application/talent/dto/list-talents-filter.dto";

import { buildDirectusQuery, DEFAULT_FIELDS } from "@infrastructure/directus/talent/talent.query-builder";

describe("buildDirectusQuery", () => {
  it("monta querystring com filtros e normalizações esperadas", () => {
    const raw = {
      page: "2",
      limit: "15",
      sort: "name,-date_updated",
      email_search: "  john@example.com ",
      department_eq: "Engineering",
      departments: "Engineering,Product",
      orchestrator_state: "RUNNING",
      orchestrator_null: "true",
      pdi_plan_ready: "false",
      status: "ACTIVE,INACTIVE",
      phone_number: "(11) 98888-7777",
      verified_phone_number: " 21 98888-1111 ",
      verified_only: "true",
      leaders: "1,2",
      leader_is_null: "false",
      roles: "9,10",
      target_role_is_null: "true",
      matchMin: "80",
      graduationCourses: "Engenharia,Design",
      graduationInstitutions: "USP,MIT",
      current_cycle: "3",
      current_cycle_min: "1",
      current_cycle_max: "4",
      reset_count_min: "2",
      reset_count_max: "5",
      date_created_from: "2024-01-05",
      date_created_to: "2024-01-20",
      date_updated_from: "2024-02-01",
      date_updated_to: "2024-02-15",
      last_status_change_from: "2024-01-12",
      last_status_change_to: "2024-01-25",
      last_reset_from: "2024-01-02",
      last_reset_to: "2024-01-18",
      date_deleted_from: "2024-02-10",
      date_deleted_to: "2024-02-20",
      date_deleted_is_null: "false",
      start_date_from: "2024-01-01",
      start_date_to: "2024-01-31",
      end_date_from: "2024-02-01",
      end_date_to: "2024-02-28",
      activeFrom: "2024-01-10",
      activeTo: "2024-03-01",
      q: " delta ",
    };

    const filter = ListTalentsFilter.parse(raw);
    const query = buildDirectusQuery(filter);
    const params = new URLSearchParams(query);

    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("15");
    expect(params.getAll("sort[]")).toEqual(["name", "-date_updated"]);
    expect(params.get("fields")).toBe(DEFAULT_FIELDS);
    expect(params.get("meta")).toBe("filter_count");

    expect(params.get("filter[date_deleted][_nnull]")).toBe("true");
    expect(params.get("filter[date_deleted][_gte]")).toBe("2024-02-10");
    expect(params.get("filter[date_deleted][_lte]")).toBe("2024-02-20");

    expect(params.get("filter[department][_in]")).toBe("Engineering,Product");
    expect(params.get("filter[orchestrator_state][_null]")).toBe("true");
    expect(params.get("filter[pdi_plan_ready][_eq]")).toBe("false");
    expect(params.get("filter[current_status][_in]")).toBe("ACTIVE,INACTIVE");

    expect(params.get("filter[phone_number][_icontains]")).toBe("11988887777");
    expect(params.get("filter[verified_phone_number][_icontains]")).toBe("21988881111");
    expect(params.get("filter[verified_phone_number][_nnull]")).toBe("true");

    expect(params.get("filter[leader_id][_in]")).toBe("1,2");
    expect(params.get("filter[leader_id][_nnull]")).toBe("true");
    expect(params.get("filter[target_role_id][_in]")).toBe("9,10");
    expect(params.get("filter[target_role_id][_null]")).toBe("true");
    expect(params.get("filter[target_role_id][match][_gte]")).toBe("80");

    expect(params.get("filter[graduation_course][_in]")).toBe("Engenharia,Design");
    expect(params.get("filter[graduation_institution][_in]")).toBe("USP,MIT");

    expect(params.get("filter[current_cycle][_eq]")).toBe("3");
    expect(params.get("filter[current_cycle][_gte]")).toBe("1");
    expect(params.get("filter[current_cycle][_lte]")).toBe("4");
    expect(params.get("filter[reset_count][_gte]")).toBe("2");
    expect(params.get("filter[reset_count][_lte]")).toBe("5");

    expect(params.get("filter[date_created][_gte]")).toBe("2024-01-05");
    expect(params.get("filter[date_created][_lte]")).toBe("2024-01-20");
    expect(params.get("filter[date_updated][_gte]")).toBe("2024-02-01");
    expect(params.get("filter[date_updated][_lte]")).toBe("2024-02-15");
    expect(params.get("filter[last_status_change_at][_gte]")).toBe("2024-01-12");
    expect(params.get("filter[last_status_change_at][_lte]")).toBe("2024-01-25");
    expect(params.get("filter[last_reset_at][_gte]")).toBe("2024-01-02");
    expect(params.get("filter[last_reset_at][_lte]")).toBe("2024-01-18");

    expect(params.get("filter[start_date][_gte]")).toBe("2024-01-01");
    expect(params.getAll("filter[start_date][_lte]")).toEqual(["2024-01-31", "2024-03-01"]);
    expect(params.getAll("filter[end_date][_gte]")).toEqual(["2024-02-01", "2024-01-10"]);
    expect(params.get("filter[end_date][_lte]")).toBe("2024-02-28");

    expect(params.get("filter[_or][0][department][_icontains]")).toBe("delta");
    expect(params.get("filter[_or][4][leader_id][position][_icontains]")).toBe("delta");
  });
});
