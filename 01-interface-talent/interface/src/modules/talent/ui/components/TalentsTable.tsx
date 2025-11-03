"use client";

// @improved Modern, accessible table with expandable rows for talent details
import React, { Fragment, useState } from "react";
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
}: TalentsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleRow = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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
        <p className="text-sm text-[var(--color-subtle)]">{errorDetail ?? "Tente novamente mais tarde."}</p>
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
        <span aria-hidden className="text-4xl">🗂️</span>
        <p className="text-base font-medium text-[var(--color-text)]">Nenhum talento encontrado</p>
        <p>Revise os filtros ou limpe a busca para visualizar novos resultados.</p>
      </div>
    );
  }

  const currentSort = sort ?? "";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-subtle)]" aria-live="polite">
        Mostrando página {page} de {totalPages} • {total} resultado(s)
      </p>
      <div className="overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <table className="min-w-[1600px] w-full text-sm text-[var(--color-text)]" role="table">
          <thead className="sticky top-0 z-10 bg-[var(--color-soft)]/80 backdrop-blur">
            <tr role="row" className="text-left text-xs uppercase tracking-wide text-[var(--color-subtle)]">
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Nome"
                  field="user_id.last_name"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Escolaridade"
                  field="graduation_course"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Email"
                  field="user_id.email"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Departamento"
                  field="department"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Status"
                  field="current_status"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Orquestrador"
                  field="orchestrator_state"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="PDI"
                  field="pdi_plan_ready"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">Líder</th>
              <th scope="col" className="px-4 py-3">Cargo alvo</th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Início"
                  field="start_date"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Fim"
                  field="end_date"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
              <th scope="col" className="px-4 py-3">
                <SortHeaderButton
                  label="Ciclo atual"
                  field="current_cycle"
                  currentSort={currentSort}
                  onSortChange={onSortChange}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/60" role="rowgroup">
            {talents.map((talent) => {
              const isOpen = !!expanded[talent.id];
              const fullName = buildName(talent);
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
                        <span className="text-xs text-[var(--color-subtle)]" aria-hidden>
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
                      <Badge variant={orchestratorVariant(talent.orchestratorState)}>
                        {talent.orchestratorState ?? "—"}
                      </Badge>
                    </Cell>
                    <Cell>
                      <Badge variant={booleanVariant(talent.pdiPlanReady)}>
                        {talent.pdiPlanReady ? "Sim" : "Não"}
                      </Badge>
                    </Cell>
                    <Cell value={[talent.leader?.position, talent.leader?.department].filter(Boolean).join(" / ")} />
                    <Cell value={talent.targetRole?.name} />
                    <Cell value={formatShortDate(talent.startDate)} />
                    <Cell value={formatShortDate(talent.endDate)} />
                    <Cell value={talent.currentCycle != null ? String(talent.currentCycle) : undefined} />
                  </tr>
                  {isOpen ? (
                    <tr role="row" className="bg-[var(--color-card)]/80" id={`talent-details-${talent.id}`}>
                      <td colSpan={12} className="p-0">
                        <div className="mx-4 mb-4 -mt-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/60 shadow-lg shadow-black/20">
                          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">Detalhes do talento</p>
                              <p className="text-xs text-[var(--color-subtle)]">{fullName}</p>
                            </div>
                            <button
                              type="button"
                              className="btn-ghost text-xs"
                              onClick={() => toggleRow(talent.id)}
                            >
                              Fechar
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
                            {buildTalentDetailInfo(talent).map(({ label, value }) => (
                              <Info key={label} label={label} value={value} />
                            ))}
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

      <nav className="flex items-center gap-3 text-sm text-[var(--color-subtle)]" aria-label="Paginação" aria-live="polite">
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
    </div>
  );
}

type SortHeaderButtonProps = {
  label: string;
  field: string;
  currentSort: string;
  onSortChange: (sort: string) => void;
};

function SortHeaderButton({ label, field, currentSort, onSortChange }: SortHeaderButtonProps) {
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

function Badge({ children, variant = "muted" }: { children: React.ReactNode; variant?: BadgeVariant }) {
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
    { label: "Última mudança de status", value: formatDateTime(talent.lastStatusChangeAt) },
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
    { label: "Cargo alvo ID", value: formatNumber(talent.targetRoleId ?? talent.targetRole?.id) },
    { label: "Cargo alvo", value: talent.targetRole?.name },
    { label: "Líder ID", value: formatNumber(talent.leaderId ?? talent.leader?.id) },
    { label: "Líder", value: leaderSummary || undefined },
  ];

  if (talent.targetRole?.description) {
    details.push({ label: "Descrição do cargo", value: talent.targetRole.description });
  }
  const skills = formatSkills(talent.currentSkills);
  if (skills) {
    details.push({ label: "Skills atuais", value: skills });
  }

  return details;
}

function Cell({ children, value, as: Element = "td", scope }: { children?: React.ReactNode; value?: string | null; as?: "td" | "th"; scope?: "row" | "col" }) {
  const content = children ?? (value ? <span className="truncate" title={value}>{value}</span> : "—");
  return (
    <Element scope={scope} className="px-4 py-3 text-sm text-[var(--color-text)]" title={typeof value === "string" ? value : undefined}>
      {content}
    </Element>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">{label}</p>
      <p className="truncate text-sm font-medium text-[var(--color-text)]" title={value ?? undefined}>
        {value ?? "—"}
      </p>
    </div>
  );
}
