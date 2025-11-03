export type Department = "Engineering" | "Design" | "Product" | "Marketing" | "Operations";
export type TalentStatus = "ACTIVE" | "ONBOARDING" | "PENDING_FIRST_ACCESS" | "INACTIVE";

export type AiQuery = {
  current_cycle?: number;
  graduation_institution?: string;
  graduation_course?: string;
  department?: Department;
  target_role_names?: string[];
  current_status?: TalentStatus;
  pdi_plan_ready?: boolean;
  leader_null?: boolean;
  date_updated_gte?: string;
};

export type DirectusFilter = Record<
  string,
  Record<string, string | number | boolean | Array<string | number>>
>;

export type ParsedSearch = {
  extracted: AiQuery;
  filter: DirectusFilter;
  queryString: string;
  resolvedRoleIds: number[];
};

type TargetRoleResolver =
  | ((names: string[]) => Promise<number[] | undefined> | number[] | undefined)
  | undefined;

export type ParseOptions = {
  now?: Date;
  resolveTargetRoles?: TargetRoleResolver;
};

const departmentSynonyms: Record<Department, string[]> = {
  Engineering: ["engineering", "engenharia", "dev", "ti", "tecnologia", "software"],
  Design: ["design", "designer", "ux", "ui"],
  Product: ["product", "produto", "pm", "gestao de produto"],
  Marketing: ["marketing", "mkt", "social media", "publicidade"],
  Operations: ["operacoes", "operacional", "ops", "logistica"],
};

const statusSynonyms: Record<TalentStatus, string[]> = {
  ACTIVE: ["active", "ativo", "ativa"],
  ONBOARDING: ["onboarding", "integracao"],
  PENDING_FIRST_ACCESS: ["pending first access", "pendente primeiro acesso", "pending_first_access"],
  INACTIVE: ["inactive", "inativo", "inativa"],
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateAtKeywords(value: string): string {
  const keywords = [" com ", " sem ", " para ", " que ", " desde ", " quando ", " onde ", " com "];
  let trimmed = value;
  for (const keyword of keywords) {
    const index = trimmed.indexOf(keyword);
    if (index > 0) {
      trimmed = trimmed.slice(0, index);
    }
  }
  return collapseSpaces(trimmed.replace(/[.,;]+$/g, ""));
}

function splitList(value: string): string[] {
  if (!value) return [];
  const replaced = value.replace(/\s+(?:e|ou)\s+/g, ",");
  return replaced
    .split(/,+/)
    .map((item) => collapseSpaces(item))
    .filter(Boolean);
}

function stripArticles(value: string): string {
  let current = value;
  let previous: string;
  do {
    previous = current;
    current = current.replace(/^(?:um|uma|de|da|do|o|a)\s+/g, "");
  } while (current !== previous);
  return collapseSpaces(current);
}

function matchDepartment(normalized: string): Department | undefined {
  for (const [department, synonyms] of Object.entries(departmentSynonyms) as [Department, string[]][]) {
    for (const synonym of synonyms) {
      const pattern = new RegExp(`\\b${synonym.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (pattern.test(normalized)) return department;
    }
  }
  return undefined;
}

function matchStatus(normalized: string): TalentStatus | undefined {
  for (const [status, synonyms] of Object.entries(statusSynonyms) as [TalentStatus, string[]][]) {
    for (const synonym of synonyms) {
      const pattern = new RegExp(`\\b${synonym.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (pattern.test(normalized)) return status;
    }
  }
  return undefined;
}

function matchPdi(normalized: string): boolean | undefined {
  if (/\bsem\s+pdi\b/.test(normalized)) return false;
  if (/\bcom\s+pdi\b/.test(normalized)) return true;
  return undefined;
}

function matchLeaderNull(normalized: string): boolean | undefined {
  if (/\bsem\s+(?:lider|gestor)\b/.test(normalized)) return true;
  return undefined;
}

function matchCurrentCycle(normalized: string): number | undefined {
  const regex = /\b(?:ciclo(?:\s+atual)?|no\s+ciclo|ciclo\s+numero)\s*(\d{1,2})\b/;
  const match = normalized.match(regex);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isNaN(value) && value > 0) return value;
  return undefined;
}

function matchGraduationCourse(normalized: string): string | undefined {
  const regex =
    /\b(?:curso(?:\s+tecnico)?(?:\s+em)?|ensino\s+medio(?:\s+em)?|formacao(?:\s+em)?)\s+([a-z0-9\s]{2,})/;
  const match = regex.exec(normalized);
  if (!match || !match[1]) return undefined;
  const portion = truncateAtKeywords(match[1]);
  if (!portion) return undefined;
  return portion;
}

function matchGraduationInstitution(normalized: string): string | undefined {
  const regex =
    /\b(?:escola|colegio|colegio estadual|instituicao|universidade|faculdade)\s+([a-z0-9\s]{2,})/;
  const match = regex.exec(normalized);
  if (!match || !match[1]) return undefined;
  const portion = truncateAtKeywords(match[1]);
  if (!portion) return undefined;
  return portion;
}

function matchTargetRoles(normalized: string): string[] {
  const patterns = [
    /\b(?:cargo|funcao|vaga|profissao)s?\s+(?:de|para)\s+([a-z0-9\s,]+)/g,
    /\b(?:trabalhar|trabalhar)\s+como\s+([a-z0-9\s,]+)/g,
    /\b(?:quer|quero|desejo|deseja|gostaria)\s+ser\s+([a-z0-9\s,]+)/g,
    /\b(?:quer|quero|desejo|deseja|gostaria)\s+trabalhar\s+como\s+([a-z0-9\s,]+)/g,
  ];

  const collected: string[] = [];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(normalized)) !== null) {
      const fragment = truncateAtKeywords(match[1]);
      if (!fragment) continue;
      const parts = splitList(fragment);
      for (const part of parts) {
        const cleaned = stripArticles(part);
        if (!cleaned) continue;
        collected.push(cleaned);
      }
    }
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const item of collected) {
    const normalizedItem = item.trim();
    if (!normalizedItem || seen.has(normalizedItem)) continue;
    seen.add(normalizedItem);
    unique.push(normalizedItem);
  }
  return unique;
}

function matchDateUpdatedGte(normalized: string, now: Date): string | undefined {
  const sinceMatch = normalized.match(/\bdesde\s+(20\d{2}-\d{2}-\d{2})\b/);
  if (sinceMatch?.[1]) {
    return sinceMatch[1];
  }
  const lastMatch = normalized.match(/\b(?:nos?\s+)?ultim[oa]s?\s+(\d{1,3})\s+dias?\b/);
  if (lastMatch?.[1]) {
    const days = Number(lastMatch[1]);
    if (!Number.isNaN(days) && days >= 0) {
      const reference = new Date(now);
      reference.setHours(0, 0, 0, 0);
      reference.setDate(reference.getDate() - days);
      return reference.toISOString().slice(0, 10);
    }
  }
  return undefined;
}

export function extractAiQuery(input: string, options: { now?: Date } = {}): AiQuery {
  const normalized = normalizeSearchText(input);
  if (!normalized) return {};

  const now = options.now ?? new Date();
  const extracted: AiQuery = {};

  const currentCycle = matchCurrentCycle(normalized);
  if (currentCycle !== undefined) extracted.current_cycle = currentCycle;

  const department = matchDepartment(normalized);
  if (department) extracted.department = department;

  const course = matchGraduationCourse(normalized);
  if (course) extracted.graduation_course = course;

  const institution = matchGraduationInstitution(normalized);
  if (institution) extracted.graduation_institution = institution;

  const status = matchStatus(normalized);
  if (status) extracted.current_status = status;

  const pdi = matchPdi(normalized);
  if (pdi !== undefined) extracted.pdi_plan_ready = pdi;

  const leaderNull = matchLeaderNull(normalized);
  if (leaderNull) extracted.leader_null = true;

  const updatedGte = matchDateUpdatedGte(normalized, now);
  if (updatedGte) extracted.date_updated_gte = updatedGte;

  const roles = matchTargetRoles(normalized);
  if (roles.length) extracted.target_role_names = roles;

  return extracted;
}

export function aiQueryToFilter(query: AiQuery, targetRoleIds: number[] = []): DirectusFilter {
  const filter: DirectusFilter = {};

  if (query.current_cycle !== undefined) {
    filter.current_cycle = { _eq: query.current_cycle };
  }
  if (query.graduation_institution) {
    filter.graduation_institution = { _icontains: query.graduation_institution };
  }
  if (query.graduation_course) {
    filter.graduation_course = { _icontains: query.graduation_course };
  }
  if (query.department) {
    filter.department = { _eq: query.department };
  }
  if (targetRoleIds.length) {
    filter.target_role_id = { _in: targetRoleIds };
  }
  if (query.current_status) {
    filter.current_status = { _eq: query.current_status };
  }
  if (query.pdi_plan_ready !== undefined) {
    filter.pdi_plan_ready = { _eq: query.pdi_plan_ready };
  }
  if (query.leader_null) {
    filter.leader_id = { _null: true };
  }
  if (query.date_updated_gte) {
    filter.date_updated = { _gte: query.date_updated_gte };
  }

  return filter;
}

export function buildFilterQueryString(filter: DirectusFilter): string {
  const params = new URLSearchParams();

  for (const [field, operators] of Object.entries(filter)) {
    if (!operators || typeof operators !== "object") continue;
    for (const [operator, rawValue] of Object.entries(operators)) {
      if (rawValue === undefined || rawValue === null) continue;

      let value: string;
      if (Array.isArray(rawValue)) {
        if (!rawValue.length) continue;
        value = rawValue.join(",");
      } else if (typeof rawValue === "boolean") {
        value = rawValue ? "true" : "false";
      } else {
        value = String(rawValue);
      }
      params.append(`filter[${field}][${operator}]`, value);
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function parseSmartSearch(input: string, options: ParseOptions = {}): Promise<ParsedSearch> {
  const extracted = extractAiQuery(input, { now: options.now });

  let resolvedRoleIds: number[] = [];
  if (extracted.target_role_names?.length && options.resolveTargetRoles) {
    const resolved = await options.resolveTargetRoles(extracted.target_role_names);
    if (Array.isArray(resolved) && resolved.length) {
      const unique = new Set<number>();
      for (const id of resolved) {
        if (typeof id === "number" && Number.isFinite(id)) {
          unique.add(id);
        }
      }
      resolvedRoleIds = Array.from(unique);
    }
  }

  const filter = aiQueryToFilter(extracted, resolvedRoleIds);
  const queryString = buildFilterQueryString(filter);

  return {
    extracted,
    filter,
    queryString,
    resolvedRoleIds,
  };
}
