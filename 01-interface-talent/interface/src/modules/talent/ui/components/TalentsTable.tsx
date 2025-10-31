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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>
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
}: {
  talents: Talent[];
  isLoading: boolean;
  isError: boolean;
  errorDetail?: string;
  total: number;
  page: number;
  limit: number;
  onPageChange: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

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
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs uppercase text-gray-600">
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Escolaridade</th>
              <th className="px-3 py-2">Skills</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Departamento</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Orquestrador</th>
              <th className="px-3 py-2">PDI</th>
              <th className="px-3 py-2">Líder</th>
              <th className="px-3 py-2">Cargo alvo</th>
              <th className="px-3 py-2">Início</th>
              <th className="px-3 py-2">Fim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {talents.map((t) => (
              <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 font-medium">
                  {(() => {
                    const parts = [t.userFirstName, t.userLastName].filter(
                      (part): part is string => Boolean(part && part.trim())
                    );
                    if (parts.length) return parts.join(" ");
                    return t.userEmail ?? "—";
                  })()}
                </td>
                <td className="px-3 py-2">{t.graduationCourse ?? "—"}</td>
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
                  {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  {t.endDate ? new Date(t.endDate).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
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
