"use client";

import React from "react";
import { Talent } from "@/hooks/useTalents";

function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: "green" | "yellow" | "red" | "blue" | "gray";
}) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
}

function statusColor(
  s?: string | null
): "green" | "yellow" | "red" | "blue" | "gray" {
  switch (s) {
    case "ACTIVE":
      return "green";
    case "ONBOARDING":
      return "blue";
    case "PENDING_FIRST_ACCESS":
    case "PENDING":
      return "yellow";
    case "INACTIVE":
      return "red";
    default:
      return "gray";
  }
}

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
}: {
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
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const currentSort = sort ?? "";
  const SortHeader = ({ label, field }: { label: string; field: string }) => {
    const isAsc = currentSort === field;
    const isDesc = currentSort === `-${field}`;
    const icon = isAsc ? "▲" : isDesc ? "▼" : "↕";
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:underline"
        onClick={() => {
          const next = isDesc ? field : isAsc ? "" : `-${field}`;
          onSortChange(next || "-date_updated");
        }}
        title={`Ordenar por ${label}`}
      >
        <span>{label}</span>
        <span className="text-gray-500 text-[10px]">{icon}</span>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-56 bg-gray-200 animate-pulse rounded" />
        <div className="overflow-hidden rounded-lg border">
          <div className="h-10 bg-gray-50" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 border-t bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      >
        <p className="font-semibold">Erro ao carregar talentos</p>
        {errorDetail ? <p className="text-sm mt-1">{errorDetail}</p> : null}
      </div>
    );
  }

  if (!talents.length) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <p className="font-medium">Nenhum talento encontrado.</p>
        <p className="text-sm text-gray-600">
          Ajuste os filtros ou limpe a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Mostrando página {page} de {totalPages} • {total} resultado(s)
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-[1600px] w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs uppercase text-gray-600">
              <th className="px-3 py-2">
                <SortHeader label="Nome" field="user_id.last_name" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Escolaridade" field="graduation_course" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Instituição" field="graduation_institution" />
              </th>
              <th className="px-3 py-2">Skills</th>
              <th className="px-3 py-2">
                <SortHeader label="Email" field="user_id.email" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Departamento" field="department" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Status" field="current_status" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Orquestrador" field="orchestrator_state" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="PDI" field="pdi_plan_ready" />
              </th>
              <th className="px-3 py-2">Líder</th>
              <th className="px-3 py-2">Cargo alvo</th>
              <th className="px-3 py-2">
                <SortHeader label="Início" field="start_date" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Fim" field="end_date" />
              </th>
              <th className="px-3 py-2">
                <SortHeader label="Ciclo atual" field="current_cycle" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {talents.map((t) => {
              const isOpen = !!expanded[t.id];
              const fullName = (() => {
                const parts = [t.userFirstName, t.userLastName].filter(
                  (part): part is string => Boolean(part && part.trim())
                );
                if (parts.length) return parts.join(" ");
                return t.userEmail ?? "—";
              })();
              return (
                <>
                  <tr
                    key={t.id}
                    className={`odd:bg-white even:bg-gray-50 hover:bg-gray-50 cursor-pointer ${
                      isOpen ? "bg-gray-50" : ""
                    }`}
                    onClick={() => toggle(t.id)}
                    aria-expanded={isOpen}
                  >
                    <td className="px-3 py-2 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-gray-500 text-xs">
                          {isOpen ? "▾" : "▸"}
                        </span>
                        {fullName}
                      </span>
                    </td>
                <td className="px-3 py-2">{t.graduationCourse ?? "—"}</td>
                <td className="px-3 py-2">{t.graduationInstitution ?? "—"}</td>
                <td className="px-3 py-2">
                  {Array.isArray(t.currentSkills)
                    ? t.currentSkills.join(", ")
                    : t.currentSkills ?? "—"}
                </td>
                <td className="px-3 py-2">{t.userEmail ?? "—"}</td>
                <td className="px-3 py-2">{t.department ?? "—"}</td>
                <td className="px-3 py-2">
                  <Badge color={statusColor(t.currentStatus)}>
                    {t.currentStatus ?? "—"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge color={statusColor(t.orchestratorState)}>
                    {t.orchestratorState ?? "—"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge color={t.pdiPlanReady ? "green" : "gray"}>
                    {t.pdiPlanReady ? "Sim" : "Não"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  {t.leader?.position ?? "—"}
                  {t.leader?.department ? ` / ${t.leader.department}` : ""}
                </td>
                <td className="px-3 py-2">{t.targetRole?.name ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  {t.startDate
                    ? new Date(t.startDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  {t.endDate ? new Date(t.endDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2">{t.currentCycle ?? "—"}</td>
                  </tr>
                  {isOpen ? (
                    <tr className="bg-white">
                      <td colSpan={14} className="p-0">
                        <div className="mx-3 mb-3 -mt-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Detalhes do talento</p>
                              <p className="text-xs text-gray-600">{fullName}</p>
                            </div>
                            <button
                              type="button"
                              className="text-xs text-gray-600 hover:underline"
                              onClick={() => toggle(t.id)}
                            >
                              Fechar
                            </button>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Info label="Email" value={t.userEmail} />
                            <Info label="Departamento" value={t.department} />
                            <Info label="Status" value={t.currentStatus} />
                            <Info label="Orquestrador" value={t.orchestratorState} />
                            <Info label="PDI pronto" value={t.pdiPlanReady ? "Sim" : "Não"} />
                            <Info label="Curso" value={t.graduationCourse} />
                            <Info label="Instituição" value={t.graduationInstitution} />
                            <Info label="Skills" value={Array.isArray(t.currentSkills) ? t.currentSkills.join(", ") : t.currentSkills} />
                            <Info label="Ciclo atual" value={t.currentCycle != null ? String(t.currentCycle) : null} />
                            <Info label="Ciclo ID" value={t.currentCycleId} />
                            <Info label="Líder" value={[t.leader?.position, t.leader?.department].filter(Boolean).join(" / ") || null} />
                            <Info label="Cargo alvo" value={t.targetRole?.name ?? null} />
                            <Info label="Início" value={t.startDate ? new Date(t.startDate).toLocaleDateString() : null} />
                            <Info label="Fim" value={t.endDate ? new Date(t.endDate).toLocaleDateString() : null} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <nav className="flex items-center gap-3 text-sm" aria-label="Paginação">
        <button
          className="rounded border px-2 py-1 disabled:opacity-40"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          ← Anterior
        </button>
        <span>
          Página {page} / {totalPages}
        </span>
        <button
          className="rounded border px-2 py-1 disabled:opacity-40"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Próxima página"
        >
          Próxima →
        </button>
      </nav>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate">{value ?? "—"}</p>
    </div>
  );
}
