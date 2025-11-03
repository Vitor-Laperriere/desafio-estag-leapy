import { env } from "@/core/env";
import { httpGet } from "@/core/http/fetch";

type TargetRole = {
  id: number;
  name?: string | null;
  description?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  date_deleted?: string | null;
  important_skills?: unknown;
  success_criteria?: string | null;
  talent_id?: string | null;
  required_skills?: unknown;
  talent_current_skills?: unknown;
  match?: number | null;
};

export const metadata = {
  title: "Talentos • Insights",
};

export default async function InsightsPage() {
  const targetRoles = await fetchTargetRoles();

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-6 px-6 py-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Painel de insights</h2>
          <p className="text-sm text-[var(--color-subtle)]">
            Esta página servirá para análises e relatórios futuros. Utilize o botão “Adicionar filtro” para navegar
            rapidamente aos filtros da página principal.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/60 p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Próximos passos</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-subtle)]">
              <li>• Adicionar gráficos de evolução de talentos.</li>
              <li>• Inserir indicadores de status por departamento.</li>
              <li>• Conectar-se com futuras APIs de insights.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/60 p-6 text-sm text-[var(--color-subtle)]">
            <p>
              Enquanto os dados não chegam, aproveite para avaliar os filtros na página principal e planejar os widgets
              que farão parte deste painel.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Mapa de cargos alvo</h3>
          <span className="text-xs text-[var(--color-subtle)]">Total: {targetRoles.length}</span>
        </div>
        {targetRoles.length ? (
          <div className="overflow-auto">
            <table className="min-w-[1400px] w-full text-sm text-[var(--color-text)]">
              <thead className="bg-[var(--color-soft)]/80 text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">Criado em</th>
                  <th className="px-4 py-3 text-left">Atualizado em</th>
                  <th className="px-4 py-3 text-left">Excluído em</th>
                  <th className="px-4 py-3 text-left">Skills importantes</th>
                  <th className="px-4 py-3 text-left">Critérios de sucesso</th>
                  <th className="px-4 py-3 text-left">Talent ID</th>
                  <th className="px-4 py-3 text-left">Skills requeridas</th>
                  <th className="px-4 py-3 text-left">Skills atuais do talento</th>
                  <th className="px-4 py-3 text-left">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/60">
                {targetRoles.map((role) => (
                  <tr key={role.id} className="align-top">
                    <td className="px-4 py-3 align-top">{role.id}</td>
                    <td className="px-4 py-3 align-top">{role.name ?? "—"}</td>
                    <td className="px-4 py-3 align-top whitespace-pre-wrap break-words text-sm">{role.description ?? "—"}</td>
                    <td className="px-4 py-3 align-top">{formatDateTime(role.date_created)}</td>
                    <td className="px-4 py-3 align-top">{formatDateTime(role.date_updated)}</td>
                    <td className="px-4 py-3 align-top">{formatDateTime(role.date_deleted)}</td>
                    <td className="px-4 py-3 align-top text-xs whitespace-pre-wrap break-words">{formatJson(role.important_skills)}</td>
                    <td className="px-4 py-3 align-top whitespace-pre-wrap break-words text-sm">{role.success_criteria ?? "—"}</td>
                    <td className="px-4 py-3 align-top">{role.talent_id ?? "—"}</td>
                    <td className="px-4 py-3 align-top text-xs whitespace-pre-wrap break-words">{formatJson(role.required_skills)}</td>
                    <td className="px-4 py-3 align-top text-xs whitespace-pre-wrap break-words">{formatJson(role.talent_current_skills)}</td>
                    <td className="px-4 py-3 align-top">{formatMatch(role.match)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-[var(--color-subtle)]">Nenhum cargo encontrado no momento.</p>
        )}
      </div>
    </div>
  );
}

async function fetchTargetRoles(): Promise<TargetRole[]> {
  try {
    const url = `${env.DIRECTUS_URL}/items/target_roles?limit=500&sort[]=name`;
    const res = await httpGet(url, {
      headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
      next: { revalidate: 60 },
    });

    const json = await res.json();
    if (!Array.isArray(json?.data)) return [];
    return json.data as TargetRole[];
  } catch (error) {
    console.error("Falha ao carregar target_roles", error);
    return [];
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTimeFormatter.format(date);
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") {
    return value.trim().length ? value : "—";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatMatch(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return value.toFixed(2);
}
