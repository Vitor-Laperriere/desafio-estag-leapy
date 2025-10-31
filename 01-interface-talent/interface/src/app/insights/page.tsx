// insights/page.tsx
// Purpose: placeholder insights page reusing global header and theming.
// @improved Secondary view using shared layout and tokens
export const metadata = {
  title: "Talentos • Insights",
};

export default function InsightsPage() {
  return (
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
            Enquanto os dados não chegam, aproveite para avaliar os filtros na página principal e planejar os widgets que
            farão parte deste painel.
          </p>
        </div>
      </div>
    </div>
  );
}
