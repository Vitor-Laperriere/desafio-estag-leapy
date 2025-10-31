import { NextResponse } from "next/server";

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? "";
const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE ?? 10);

function norm(v: string | null): string {
  if (!v) return "";
  const trimmed = v.trim();
  return trimmed === "" ? "" : trimmed;
}

function pushRange(
  params: string[],
  field: string,
  from?: string,
  to?: string
) {
  if (from) params.push(`filter[${field}][_gte]=${encodeURIComponent(from)}`);
  if (to) params.push(`filter[${field}][_lte]=${encodeURIComponent(to)}`);
}
function pushNumberRange(
  params: string[],
  field: string,
  min?: string,
  max?: string
) {
  if (min) params.push(`filter[${field}][_gte]=${encodeURIComponent(min)}`);
  if (max) params.push(`filter[${field}][_lte]=${encodeURIComponent(max)}`);
}

export async function GET(req: Request) {
  if (!DIRECTUS_TOKEN) {
    return NextResponse.json(
      {
        error: "DIRECTUS_TOKEN ausente no servidor Next",
        hint: "Defina DIRECTUS_TOKEN em interface/.env.local e reinicie",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const limit = Math.max(
    Number(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE)),
    1
  );
  const sort = norm(searchParams.get("sort")) || "-date_updated";

  const search = norm(searchParams.get("search"));

  const email = norm(searchParams.get("email")); // user_id.email (JOIN)
  const q = norm(searchParams.get("q")); // busca geral: search=
  const department = norm(searchParams.get("department"));
  const orchestrator = norm(searchParams.get("orchestrator_state"));
  const pdi = norm(searchParams.get("pdi_plan_ready"));
  const leaderId = norm(searchParams.get("leader_id"));
  const targetRoleId = norm(searchParams.get("target_role_id"));
  const id = norm(searchParams.get("id"));
  const userId = norm(searchParams.get("user_id"));
  const phone = norm(searchParams.get("phone_number"));
  const graduationCourse = norm(searchParams.get("graduation_course"));
  const graduationInstitution = norm(
    searchParams.get("graduation_institution")
  );
  const currentStatus = norm(searchParams.get("current_status"));
  const verifiedPhone = norm(searchParams.get("verified_phone_number"));
  const resetMin = norm(searchParams.get("reset_count_min"));
  const resetMax = norm(searchParams.get("reset_count_max"));
  const currentCycle = norm(searchParams.get("current_cycle"));
  const currentCycleMin = norm(searchParams.get("current_cycle_min"));
  const currentCycleMax = norm(searchParams.get("current_cycle_max"));
  const currentCycleId = norm(searchParams.get("current_cycle_id"));

  const dcFrom = norm(searchParams.get("date_created_from"));
  const dcTo = norm(searchParams.get("date_created_to"));
  const duFrom = norm(searchParams.get("date_updated_from"));
  const duTo = norm(searchParams.get("date_updated_to"));
  const ddFrom = norm(searchParams.get("date_deleted_from"));
  const ddTo = norm(searchParams.get("date_deleted_to"));
  const sdFrom = norm(searchParams.get("start_date_from"));
  const sdTo = norm(searchParams.get("start_date_to"));
  const edFrom = norm(searchParams.get("end_date_from"));
  const edTo = norm(searchParams.get("end_date_to"));
  const lscFrom = norm(searchParams.get("last_status_change_from"));
  const lscTo = norm(searchParams.get("last_status_change_to"));
  const lrFrom = norm(searchParams.get("last_reset_from"));
  const lrTo = norm(searchParams.get("last_reset_to"));
  // opcional: tratar nulos explícitos
  const dateDeletedIsNull = norm(searchParams.get("date_deleted_is_null")); // "true"/"false"

  const params: string[] = [
    `page=${encodeURIComponent(String(page))}`,
    `limit=${encodeURIComponent(String(limit))}`,
    `sort[]=${encodeURIComponent(sort)}`,
    `fields=${encodeURIComponent(
      "*,user_id.email,leader_id.*,target_role_id.*"
    )}`,
    `meta=filter_count`,
  ];

  // e-mail via JOIN
  if (email)
    params.push(
      `filter[user_id][email][_icontains]=${encodeURIComponent(email)}`
    );
  // busca geral
  if (q) params.push(`search=${encodeURIComponent(q)}`);

  if (department)
    params.push(`filter[department][_eq]=${encodeURIComponent(department)}`);
  if (orchestrator)
    params.push(
      `filter[orchestrator_state][_eq]=${encodeURIComponent(orchestrator)}`
    );
  if (pdi === "true" || pdi === "false")
    params.push(`filter[pdi_plan_ready][_eq]=${pdi}`);
  if (leaderId)
    params.push(`filter[leader_id][_eq]=${encodeURIComponent(leaderId)}`);
  if (targetRoleId)
    params.push(
      `filter[target_role_id][_eq]=${encodeURIComponent(targetRoleId)}`
    );

  // >>> Demais campos (iguais/contém/ranges)
  if (id) params.push(`filter[id][_eq]=${encodeURIComponent(id)}`);
  if (userId) params.push(`filter[user_id][_eq]=${encodeURIComponent(userId)}`);
  if (phone)
    params.push(
      `filter[phone_number][_icontains]=${encodeURIComponent(phone)}`
    );
  if (graduationCourse)
    params.push(
      `filter[graduation_course][_icontains]=${encodeURIComponent(
        graduationCourse
      )}`
    );
  if (graduationInstitution)
    params.push(
      `filter[graduation_institution][_icontains]=${encodeURIComponent(
        graduationInstitution
      )}`
    );
  if (currentStatus)
    params.push(
      `filter[current_status][_eq]=${encodeURIComponent(currentStatus)}`
    );
  if (verifiedPhone)
    params.push(
      `filter[verified_phone_number][_icontains]=${encodeURIComponent(
        verifiedPhone
      )}`
    );
  if (currentCycle)
    params.push(
      `filter[current_cycle][_eq]=${encodeURIComponent(currentCycle)}`
    );
  else
    pushNumberRange(params, "current_cycle", currentCycleMin, currentCycleMax);
  if (currentCycleId)
    params.push(
      `filter[current_cycle_id][_eq]=${encodeURIComponent(currentCycleId)}`
    );
  pushNumberRange(params, "reset_count", resetMin, resetMax);
  pushRange(params, "date_created", dcFrom, dcTo);
  pushRange(params, "date_updated", duFrom, duTo);
  // deleted: pode ser range e/ou nulo
  pushRange(params, "date_deleted", ddFrom, ddTo);
  if (dateDeletedIsNull === "true")
    params.push(`filter[date_deleted][_null]=true`);
  if (dateDeletedIsNull === "false")
    params.push(`filter[date_deleted][_nnull]=true`);
  // períodos e outros timestamps
  pushRange(params, "start_date", sdFrom, sdTo);
  pushRange(params, "end_date", edFrom, edTo);
  pushRange(params, "last_status_change_at", lscFrom, lscTo);
  pushRange(params, "last_reset_at", lrFrom, lrTo);

  const url = `${DIRECTUS_URL}/items/talents?${params.join("&")}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      next: { revalidate: 5 },
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[Directus ERROR]", res.status, detail);
      return NextResponse.json(
        { error: "Falha ao consultar Directus", status: res.status, detail },
        { status: 500 }
      );
    }

    const json = await res.json();
    return NextResponse.json({ data: json.data ?? [], meta: json.meta ?? {} });
  } catch (e: any) {
    console.error("[BFF ERROR]", e);
    return NextResponse.json(
      { error: "Erro interno no BFF", detail: e?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}
