"use client";

// @improved Modern, accessible table with expandable rows for talent details
import React, { Fragment, useState } from "react";
import Link from "next/link";
import { Talent } from "@/hooks/useTalents";

type TalentsTableProps = {
  talents: Talent[];
  isLoading: boolean;
  isError: boolean;
  errorDetail?: string;
  total: number;
  page: number;
  limit: number;
  onPageChange: (n: number) => void;
  sort: string;
  onSortChange: (s: string) => void;
  onLimitChange: (limit: number) => void;
};

export function TalentsTable({
  talents,
  isLoading,
  isError,
  errorDetail,
  total,
  page,
  limit,
  onPageChange,
  sort,
  onSortChange,
  onLimitChange,
}: TalentsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleRow = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-48 rounded-full bg-[var(--color-soft)] animate-pulse" />
        <div className="space-y-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-full animate-pulse rounded-xl bg-gradient-to-r from-[var(--color-soft)] via-[var(--color-card)] to-[var(--color-soft)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="card border border-[var(--color-secondary)] bg-[var(--color-card)] px-6 py-5 text-[var(--color-text)]"
      >
        <p className="text-base font-semibold text-[var(--color-secondary)]">
          Erro ao carregar talentos
        </p>
        <p className="text-sm text-[var(--color-subtle)]">
          {errorDetail ?? "Tente novamente mais tarde."}
        </p>
        <button
          type="button"
          className="btn-ghost mt-4"
          onClick={() => onPageChange(page)}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!talents.length) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-[var(--color-subtle)]">
        <span aria-hidden className="text-4xl">
          🗂️
        </span>
        <p className="text-base font-medium text-[var(--color-text)]">
          Nenhum talento encontrado
        </p>
        <p>
          Revise os filtros ou limpe a busca para visualizar novos resultados.
        </p>
      </div>
    );
  }

  const currentSort = sort ?? "";

  return (
    <div className="space-y-4">
      <div className="overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <table
          className="min-w-[1600px] w-full text-sm text-[var(--color-text)]"
          role="table"
        >
          <thead className="sticky top-0 z-10 bg-[var(--color-soft)]/80 backdrop-blur">
            <tr
              role="row"
              className="text-left text-xs uppercase tracking-wide text-[var(--color-subtle)]"
            >
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Nome"
                  field="user_id.last_name"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Escolaridade"
                  field="graduation_course"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Email"
                  field="user_id.email"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Departamento"
                  field="department"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Status"
                  field="current_status"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Orquestrador"
                  field="orchestrator_state"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="PDI"
                  field="pdi_plan_ready"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="w-40 px-2 py-3">
                <SortHeaderButton
                  label="Líder"
                  field="leader_id.position"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="w-40 px-2 py-3">
                <SortHeaderButton
                  label="Cargo alvo"
                  field="target_role_id.name"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Início"
                  field="start_date"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Fim"
                  field="end_date"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-2 py-3">
                <SortHeaderButton
                  label="Match"
                  field="target_role_id.match"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
            </tr>
          </thead>
          <tbody
            className="divide-y divide-[var(--color-border)]/60"
            role="rowgroup"
          >
            {talents.map((talent) => {
              const isOpen = !!expanded[talent.id];
              const fullName = buildName(talent);
              const talentDetails = buildTalentDetailInfo(talent);
              const {
                general: targetRoleGeneral,
                skills: targetRoleSkills,
                match: targetRoleMatch,
              } = buildTargetRoleInfo(talent);
              const hasSkillComparison =
                (targetRoleSkills.important && targetRoleSkills.important.length > 0) ||
                (targetRoleSkills.required && targetRoleSkills.required.length > 0) ||
                (targetRoleSkills.current && targetRoleSkills.current.length > 0);
              const matchDisplay =
                targetRoleMatch ?? formatMatch(talent.targetRole?.match ?? null);
              return (
                <Fragment key={talent.id}>
                  <tr
                    role="row"
                    className={`cursor-pointer transition-colors hover:bg-[var(--color-soft)]/40 ${
                      isOpen ? "bg-[var(--color-soft)]/30" : ""
                    }`}
                    onClick={() => toggleRow(talent.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleRow(talent.id);
                      }
                    }}
                    tabIndex={0}
                    aria-expanded={isOpen}
                    aria-controls={`talent-details-${talent.id}`}
                  >
                    <Cell as="th" scope="row">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="text-xs text-[var(--color-subtle)]"
                          aria-hidden
                        >
                          {isOpen ? "▾" : "▸"}
                        </span>
                        <span className="truncate" title={fullName}>
                          {fullName}
                        </span>
                      </span>
                    </Cell>
                    <Cell value={talent.graduationCourse} />
                    <Cell>
                      {talent.userEmail ? (
                        <a
                          href={`mailto:${talent.userEmail}`}
                          className="truncate text-[var(--color-primary)] hover:underline"
                          title={talent.userEmail}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          {talent.userEmail}
                        </a>
                      ) : (
                        "—"
                      )}
                    </Cell>
                    <Cell value={talent.department} />
                    <Cell>
                      <Badge variant={statusVariant(talent.currentStatus)}>
                        {talent.currentStatus ?? "—"}
                      </Badge>
                    </Cell>
                    <Cell>
                      <Badge
                        variant={orchestratorVariant(talent.orchestratorState)}
                      >
                        {talent.orchestratorState ?? "—"}
                      </Badge>
                    </Cell>
                    <Cell>
                      <Badge variant={booleanVariant(talent.pdiPlanReady)}>
                        {talent.pdiPlanReady ? "Sim" : "Não"}
                      </Badge>
                    </Cell>
                    <Cell
                      value={[
                        talent.leader?.position,
                        talent.leader?.department,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      allowWrap
                      className="max-w-[10rem]"
                    />
                    <Cell
                      value={talent.targetRole?.name}
                      allowWrap
                      className="max-w-[10rem]"
                    />
                    <Cell value={formatShortDate(talent.startDate)} />
                    <Cell value={formatShortDate(talent.endDate)} />
                    <Cell>
                      {matchDisplay ? (
                        <Badge variant="accent">{matchDisplay}</Badge>
                      ) : (
                        "—"
                      )}
                    </Cell>
                  </tr>
                  {isOpen ? (
                    <tr
                      role="row"
                      className="bg-[var(--color-card)]/80"
                      id={`talent-details-${talent.id}`}
                    >
                      <td colSpan={12} className="p-0">
                        <div className="mx-4 mb-4 mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/60 shadow-lg shadow-black/20">
                          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">
                                Detalhes do talento
                              </p>
                              <p className="text-xs text-[var(--color-subtle)]">
                                {fullName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/talents/manage?id=${talent.id}`}
                                className="btn-ghost text-xs"
                              >
                                Gerenciar
                              </Link>
                              <button
                                type="button"
                                className="btn-ghost text-xs"
                                onClick={() => toggleRow(talent.id)}
                              >
                                Fechar
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-6 px-6 py-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                            <section className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl" aria-hidden>
                                  👤
                                </span>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                                    Dados do talento
                                  </p>
                                  <p className="text-sm text-[var(--color-subtle)]">
                                    Informações da tabela talents
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {talentDetails.map(({ label, value, wrap }) => (
                                  <Info
                                    key={label}
                                    label={label}
                                    value={value}
                                    allowWrap={wrap ?? false}
                                    {...getInfoMeta(label)}
                                  />
                                ))}
                              </div>
                            </section>
                            <section className="space-y-3 lg:border-l lg:border-[var(--color-border)] lg:pl-6">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl" aria-hidden>
                                    🎯
                                  </span>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                                      Cargo alvo vinculado
                                    </p>
                                    <p className="text-sm text-[var(--color-subtle)]">
                                      Dados da tabela target_roles
                                    </p>
                                  </div>
                                </div>
                                {targetRoleMatch ? (
                                  <span
                                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold"
                                    style={{
                                      borderColor: "var(--color-primary)",
                                      background:
                                        "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                                      color: "var(--color-primary)",
                                    }}
                                  >
                                    <span aria-hidden>⚡</span>
                                    Match {targetRoleMatch}
                                  </span>
                                ) : null}
                              </div>
                              {targetRoleGeneral.length ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  {targetRoleGeneral.map(({ label, value, wrap }) => {
                                    const meta = getInfoMeta(label);
                                    return (
                                      <Info
                                        key={`target-${label}`}
                                        label={label}
                                        value={value}
                                        allowWrap={wrap ?? false}
                                        {...meta}
                                      />
                                    );
                                  })}
                                </div>
                              ) : null}
                              {hasSkillComparison ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                                    <span aria-hidden>📊</span>
                                    <span>Comparativo de skills</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <SkillColumn
                                      title="Skills importantes"
                                      icon="⭐"
                                      variant="primary"
                                      items={targetRoleSkills.important}
                                    />
                                    <SkillColumn
                                      title="Skills requeridas"
                                      icon="🛠️"
                                      variant="accent"
                                      items={targetRoleSkills.required}
                                    />
                                    <SkillColumn
                                      title="Skills atuais (target role)"
                                      icon="📘"
                                      variant="secondary"
                                      items={targetRoleSkills.current}
                                    />
                                  </div>
                                </div>
                              ) : null}
                              {!targetRoleGeneral.length && !hasSkillComparison ? (
                                <p className="text-sm italic text-[var(--color-subtle)]">
                                  Nenhum cargo alvo associado ao talento.
                                </p>
                              ) : null}
                            </section>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 text-sm text-[var(--color-subtle)] md:flex-row md:items-center md:justify-between">
        <nav
          className="flex items-center gap-3"
          aria-label="Paginação"
          aria-live="polite"
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label="Página anterior"
            aria-disabled={page <= 1}
            rel="prev"
          >
            ← Anterior
          </button>
          <span>
            Página {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            aria-label="Próxima página"
            aria-disabled={page >= totalPages}
            rel="next"
          >
            Próxima →
          </button>
        </nav>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
          <span>Por página</span>
          <select
            className="select w-24"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

type SortHeaderButtonProps = {
  label: string;
  field: string;
  currentSort: string;
  onSortChange: (sort: string) => void;
};

function SortHeaderButton({
  label,
  field,
  currentSort,
  onSortChange,
}: SortHeaderButtonProps) {
  const isAsc = currentSort === field;
  const isDesc = currentSort === `-${field}`;
  const icon = isAsc ? "▲" : isDesc ? "▼" : "↕";
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      onClick={() => {
        const next = isDesc ? field : isAsc ? "" : `-${field}`;
        onSortChange(next || "-date_updated");
      }}
      title={`Ordenar por ${label}`}
    >
      <span>{label}</span>
      <span className="text-[10px] text-[var(--color-subtle)]">{icon}</span>
    </button>
  );
}

type BadgeVariant = "primary" | "secondary" | "accent" | "muted";

function Badge({
  children,
  variant = "muted",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className="chip chip--badge"
      data-variant={variant !== "muted" ? variant : undefined}
    >
      {children}
    </span>
  );
}

function statusVariant(status?: string | null): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "primary";
    case "ONBOARDING":
    case "PENDING":
    case "PENDING_FIRST_ACCESS":
      return "accent";
    case "INACTIVE":
      return "secondary";
    default:
      return "muted";
  }
}

function orchestratorVariant(state?: string | null): BadgeVariant {
  if (!state) return "muted";
  if (state === "ACTIVE") return "primary";
  if (state === "PENDING") return "accent";
  if (state === "ONBOARDING") return "accent";
  return "accent";
}

function booleanVariant(value: boolean | null | undefined): BadgeVariant {
  if (value === true) return "primary";
  if (value === false) return "secondary";
  return "muted";
}

function buildName(talent: Talent) {
  const parts = [talent.userFirstName, talent.userLastName].filter(
    (part): part is string => Boolean(part && part.trim())
  );
  if (parts.length) return parts.join(" ");
  return talent.userEmail ?? "—";
}

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatShortDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return shortDateFormatter.format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTimeFormatter.format(date);
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return undefined;
}

function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined ? undefined : String(value);
}

function formatSkills(skills: Talent["currentSkills"]) {
  if (Array.isArray(skills)) return skills.join(", ");
  return skills ?? undefined;
}

function buildTalentDetailInfo(talent: Talent) {
  const leaderSummary = [talent.leader?.position, talent.leader?.department]
    .filter(Boolean)
    .join(" / ");

  const details = [
    { label: "ID", value: talent.id },
    { label: "User ID", value: talent.userId },
    { label: "Email", value: talent.userEmail },
    { label: "Telefone", value: talent.phoneNumber },
    { label: "Telefone verificado", value: talent.verifiedPhoneNumber },
    { label: "Departamento", value: talent.department },
    { label: "Status", value: talent.currentStatus },
    {
      label: "Última mudança de status",
      value: formatDateTime(talent.lastStatusChangeAt),
    },
    { label: "Orquestrador", value: talent.orchestratorState },
    { label: "PDI pronto", value: formatBoolean(talent.pdiPlanReady) },
    { label: "Curso", value: talent.graduationCourse },
    { label: "Instituição", value: talent.graduationInstitution },
    { label: "Início", value: formatShortDate(talent.startDate) },
    { label: "Fim", value: formatShortDate(talent.endDate) },
    { label: "Criado em", value: formatDateTime(talent.dateCreated) },
    { label: "Atualizado em", value: formatDateTime(talent.dateUpdated) },
    { label: "Excluído em", value: formatDateTime(talent.dateDeleted) },
    { label: "Reset count", value: formatNumber(talent.resetCount) },
    { label: "Último reset", value: formatDateTime(talent.lastResetAt) },
    { label: "Ciclo atual", value: formatNumber(talent.currentCycle) },
    { label: "Ciclo ID", value: talent.currentCycleId },
    {
      label: "Líder ID",
      value: formatNumber(talent.leaderId ?? talent.leader?.id),
    },
    { label: "Líder", value: leaderSummary || undefined },
  ];

  const skills = formatSkills(talent.currentSkills);
  if (skills) {
    details.push({ label: "Skills atuais", value: skills, wrap: true });
  }

  return details;
}

function formatMatch(value: number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  const normalized = num <= 1 ? num * 100 : num;
  const digits = normalized < 10 ? 1 : 0;
  return `${normalized.toFixed(digits)}%`;
}

function normalizeSkillSet(value: unknown): string[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
          .filter(Boolean);
      }
    } catch {
      /* ignore parse errors */
    }
    return trimmed
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((entry): entry is string => Boolean(entry));
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === null || item === undefined) return "";
        if (typeof item === "string") return item;
        if (typeof item === "object") {
          try {
            return JSON.stringify(item);
          } catch {
            return String(item);
          }
        }
        return String(item);
      })
      .filter((entry): entry is string => Boolean(entry));
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${val instanceof Object ? JSON.stringify(val) : String(val)}`)
      .filter((entry): entry is string => Boolean(entry));
  }
  return [String(value)];
}

type TargetRoleInfo = {
  general: { label: string; value?: string | null; wrap?: boolean }[];
  skills: {
    important?: string[];
    required?: string[];
    current?: string[];
  };
  match?: string;
};

function buildTargetRoleInfo(talent: Talent): TargetRoleInfo {
  const info: { label: string; value?: string | null; wrap?: boolean }[] = [];
  const targetRole = talent.targetRole;
  if (!targetRole) {
    return {
      general: info,
      skills: {},
      match: undefined,
    };
  }

  const targetRoleId = formatNumber(
    talent.targetRoleId ?? targetRole?.id ?? null
  );
  if (targetRoleId) {
    info.push({ label: "Cargo alvo ID", value: targetRoleId });
  }
  if (targetRole?.name) {
    info.push({ label: "Nome do cargo", value: targetRole.name });
  }
  if (targetRole?.description) {
    info.push({
      label: "Descrição",
      value: targetRole.description,
      wrap: true,
    });
  }
  if (targetRole?.successCriteria) {
    info.push({
      label: "Critérios de sucesso",
      value: targetRole.successCriteria,
      wrap: true,
    });
  }
  const created = formatDateTime(targetRole?.dateCreated);
  if (created) info.push({ label: "Criado em (target role)", value: created });
  const updated = formatDateTime(targetRole?.dateUpdated);
  if (updated) info.push({ label: "Atualizado em (target role)", value: updated });
  const deleted = formatDateTime(targetRole?.dateDeleted);
  if (deleted) info.push({ label: "Excluído em (target role)", value: deleted });

  if (targetRole?.talentId) {
    info.push({
      label: "Talent ID (target_roles)",
      value: targetRole.talentId,
    });
  }

  const importantSkills = normalizeSkillSet(targetRole?.importantSkills);
  const requiredSkills = normalizeSkillSet(targetRole?.requiredSkills);
  const targetCurrentSkills = normalizeSkillSet(targetRole?.talentCurrentSkills);

  return {
    general: info,
    skills: {
      important: importantSkills,
      required: requiredSkills,
      current: targetCurrentSkills,
    },
    match: formatMatch(targetRole?.match ?? null),
  };
}

type InfoVariant = "primary" | "secondary" | "accent";

type VariantStyle = {
  card: React.CSSProperties;
  icon: React.CSSProperties;
  textClass: string;
  bulletClass: string;
};

const variantStyles: Record<InfoVariant, VariantStyle> = {
  primary: {
    card: {
      background: "transparent",
      borderColor: "transparent",
    },
    icon: {
      background: "transparent",
      color: "var(--color-primary)",
    },
    textClass: "text-[var(--color-text)]",
    bulletClass: "text-[var(--color-primary)]",
  },
  secondary: {
    card: {
      background: "transparent",
      borderColor: "transparent",
    },
    icon: {
      background: "transparent",
      color: "var(--color-secondary)",
    },
    textClass: "text-[var(--color-text)]",
    bulletClass: "text-[var(--color-secondary)]",
  },
  accent: {
    card: {
      background: "transparent",
      borderColor: "transparent",
    },
    icon: {
      background: "transparent",
      color: "var(--color-accent)",
    },
    textClass: "text-[var(--color-text)]",
    bulletClass: "text-[var(--color-accent)]",
  },
};

const INFO_META: Record<string, { icon: string; variant: InfoVariant }> = {
  ID: { icon: "🆔", variant: "secondary" },
  "User ID": { icon: "👤", variant: "secondary" },
  Email: { icon: "✉️", variant: "accent" },
  Telefone: { icon: "📞", variant: "primary" },
  "Telefone verificado": { icon: "✅", variant: "primary" },
  Departamento: { icon: "🏢", variant: "accent" },
  Status: { icon: "📌", variant: "accent" },
  "Última mudança de status": { icon: "⏱️", variant: "secondary" },
  Orquestrador: { icon: "🧩", variant: "accent" },
  "PDI pronto": { icon: "📋", variant: "primary" },
  Curso: { icon: "🎓", variant: "secondary" },
  Instituição: { icon: "🏫", variant: "secondary" },
  Início: { icon: "🚀", variant: "primary" },
  Fim: { icon: "🏁", variant: "secondary" },
  "Criado em": { icon: "📅", variant: "secondary" },
  "Atualizado em": { icon: "🔄", variant: "accent" },
  "Excluído em": { icon: "🗑️", variant: "secondary" },
  "Reset count": { icon: "🔁", variant: "secondary" },
  "Último reset": { icon: "⏰", variant: "accent" },
  "Ciclo atual": { icon: "📈", variant: "primary" },
  "Ciclo ID": { icon: "🪪", variant: "secondary" },
  "Líder ID": { icon: "👥", variant: "secondary" },
  Líder: { icon: "👔", variant: "primary" },
  "Skills atuais": { icon: "🧠", variant: "accent" },
  "Cargo alvo ID": { icon: "🎯", variant: "primary" },
  "Nome do cargo": { icon: "💼", variant: "primary" },
  Descrição: { icon: "📝", variant: "secondary" },
  "Critérios de sucesso": { icon: "🏆", variant: "accent" },
  "Criado em (target role)": { icon: "📅", variant: "secondary" },
  "Talent ID (target_roles)": { icon: "🧾", variant: "secondary" },
  "Atualizado em (target role)": { icon: "🔁", variant: "accent" },
  "Excluído em (target role)": { icon: "🗑️", variant: "secondary" },
};

function getInfoMeta(label: string): { icon: string; variant: InfoVariant } {
  return INFO_META[label] ?? { icon: "📌", variant: "secondary" };
}
type CellProps = {
  children?: React.ReactNode;
  value?: string | null;
  as?: "td" | "th";
  scope?: "row" | "col";
  allowWrap?: boolean;
  className?: string;
};

function Cell({
  children,
  value,
  as: Element = "td",
  scope,
  allowWrap = false,
  className = "",
}: CellProps) {
  const baseClasses =
    "px-2 py-3 text-left text-sm text-[var(--color-text)] align-top";
  const wrappingClasses = allowWrap
    ? "whitespace-normal break-words"
    : "whitespace-nowrap";
  const cellClass = `${baseClasses} ${wrappingClasses} ${className}`.trim();

  const content =
    children ??
    (value ? (
      <span className={allowWrap ? "block" : "truncate block"} title={value}>
        {value}
      </span>
    ) : (
      "—"
    ));
  return (
    <Element
      scope={scope}
      className={cellClass}
      title={typeof value === "string" ? value : undefined}
    >
      {content}
    </Element>
  );
}

function Info({
  label,
  value,
  allowWrap = false,
  icon = "📌",
  variant = "primary",
}: {
  label: string;
  value?: string | null;
  allowWrap?: boolean;
  icon?: string;
  variant?: InfoVariant;
}) {
  const styles = variantStyles[variant];
  const valueClass = allowWrap
    ? `whitespace-pre-wrap break-words ${styles.textClass}`
    : `truncate ${styles.textClass}`;
  return (
    <div
      className="flex min-w-0 items-start gap-3 rounded-2xl border px-3 py-3 shadow-sm"
      style={styles.card}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
        style={styles.icon}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
          {label}
        </p>
        <p className={valueClass} title={value ?? undefined}>
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function SkillColumn({
  title,
  icon,
  variant,
  items,
}: {
  title: string;
  icon: string;
  variant: InfoVariant;
  items?: string[];
}) {
  const styles = variantStyles[variant];
  return (
    <div
      className="flex min-w-0 flex-col gap-3 rounded-2xl border px-3 py-3 shadow-sm"
      style={styles.card}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-subtle)]">
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-base"
          style={styles.icon}
          aria-hidden
        >
          {icon}
        </span>
        <span className={styles.textClass}>{title}</span>
      </div>
      {items && items.length ? (
        <ul className="space-y-1 text-sm">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-2">
              <span className={`mt-1 text-xs ${styles.bulletClass}`} aria-hidden>
                ●
              </span>
              <span className="break-words text-[var(--color-text)]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic text-[var(--color-subtle)]">Sem registros</p>
      )}
    </div>
  );
}
