"use client";

import { useMemo, useRef, useState, useEffect, type Dispatch, type SetStateAction, type RefObject, type ReactNode } from "react";
import useSWR from "swr";
import { useTalents } from "@/hooks/useTalents";
import { TalentsTable } from "@/modules/talent/ui/components/TalentsTable";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date_updated");

  const [searchEmail, setSearchEmail] = useState("");
  const [generalQ, setGeneralQ] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [orchestrator, setOrchestrator] = useState("");
  const [orchestrators, setOrchestrators] = useState<string[]>([]);
  const [orchestratorNull, setOrchestratorNull] = useState(false);
  const [pdi, setPdi] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [id, setId] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [onlyVerifiedPhone, setOnlyVerifiedPhone] = useState(false);
  const [gradCourse, setGradCourse] = useState("");
  const [gradInst, setGradInst] = useState("");
  const [coursesSel, setCoursesSel] = useState<string[]>([]);
  const [instSel, setInstSel] = useState<string[]>([]);
  const [leaderId, setLeaderId] = useState("");
  const [leaders, setLeaders] = useState<string[]>([]);
  const [targetRoleId, setTargetRoleId] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [noLeader, setNoLeader] = useState(false);
  const [noRole, setNoRole] = useState(false);
  const [currentCycle, setCurrentCycle] = useState("");
  const [currentCycleId, setCurrentCycleId] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");

  const [resetMin, setResetMin] = useState("");
  const [resetMax, setResetMax] = useState("");
  const [cycleMin, setCycleMin] = useState("");
  const [cycleMax, setCycleMax] = useState("");

  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  const [dateUpdatedFrom, setDateUpdatedFrom] = useState("");
  const [dateUpdatedTo, setDateUpdatedTo] = useState("");
  const [dateDeletedFrom, setDateDeletedFrom] = useState("");
  const [dateDeletedTo, setDateDeletedTo] = useState("");
  const [deletedFilter, setDeletedFilter] =
    useState<"active" | "include" | "only">("active");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");
  const [lastStatusChangeFrom, setLastStatusChangeFrom] = useState("");
  const [lastStatusChangeTo, setLastStatusChangeTo] = useState("");
  const [lastResetFrom, setLastResetFrom] = useState("");
  const [lastResetTo, setLastResetTo] = useState("");

  // helpers para chips
  const today = useMemo(() => new Date(), []);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  // autocomplete para escolaridade/instituição
  const { data: coursesDistinct } = useSWR<{ data: string[] }>(
    "/api/distinct?collection=talents&field=graduation_course",
    (u) => fetch(u).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  const { data: institutionsDistinct } = useSWR<{ data: string[] }>(
    "/api/distinct?collection=talents&field=graduation_institution",
    (u) => fetch(u).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  const { data: leadersList } = useSWR<{ data: { id: number; position?: string; department?: string }[] }>(
    "/api/leaders",
    (u) => fetch(u).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  const { data: rolesList } = useSWR<{ data: { id: number; name: string }[] }>(
    "/api/roles",
    (u) => fetch(u).then((r) => r.json()),
    { revalidateOnFocus: false }
  );

  // util: dropdown que fecha ao clicar fora
  function useClickAway(ref: RefObject<HTMLElement>, onAway: () => void) {
    useEffect(() => {
      function handler(e: MouseEvent) {
        if (!ref.current) return;
        if (!ref.current.contains(e.target as Node)) onAway();
      }
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [ref, onAway]);
  }

  function MultiCheckboxDropdown({
    label,
    values,
    selected,
    onChange,
    className = "",
    footer,
  }: {
    label: string;
    values: { value: string; label: string }[];
    selected: string[];
    onChange: (next: string[]) => void;
    className?: string;
    footer?: ReactNode;
  }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickAway(ref, () => setOpen(false));
    const display = selected.length ? selected.join(", ") : "(todos)";
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm bg-white flex items-center justify-between min-w-[220px]"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="truncate text-left">{display}</span>
          <span className="text-gray-500 ml-2">▾</span>
        </button>
        {open ? (
          <div className="absolute z-20 mt-1 bg-white border rounded shadow p-2 min-w-[220px] max-h-64 overflow-auto space-y-1">
            {values.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? Array.from(new Set([...selected, opt.value]))
                      : selected.filter((x) => x !== opt.value);
                    onChange(next);
                  }}
                />
                <span className="truncate">{opt.label}</span>
              </label>
            ))}
            {footer ? <div className="border-t my-1" /> : null}
            {footer ?? null}
          </div>
        ) : null}
      </div>
    );
  }
  type DateFieldConfig = {
    key: string;
    label: string;
    value: string;
    setter: Dispatch<SetStateAction<string>>;
  };
  const dateFieldConfigs: DateFieldConfig[] = [
    { key: "date_created_from", label: "Criado ≥", value: dateCreatedFrom, setter: setDateCreatedFrom },
    { key: "date_created_to", label: "Criado ≤", value: dateCreatedTo, setter: setDateCreatedTo },
    { key: "date_updated_from", label: "Atualizado ≥", value: dateUpdatedFrom, setter: setDateUpdatedFrom },
    { key: "date_updated_to", label: "Atualizado ≤", value: dateUpdatedTo, setter: setDateUpdatedTo },
    { key: "active_from", label: "Vigente desde (sobreposição)", value: activeFrom, setter: setActiveFrom },
    { key: "active_to", label: "Vigente até (sobreposição)", value: activeTo, setter: setActiveTo },
    { key: "start_date_from", label: "Início ≥", value: startDateFrom, setter: setStartDateFrom },
    { key: "start_date_to", label: "Início ≤", value: startDateTo, setter: setStartDateTo },
    { key: "end_date_from", label: "Fim ≥", value: endDateFrom, setter: setEndDateFrom },
    { key: "end_date_to", label: "Fim ≤", value: endDateTo, setter: setEndDateTo },
    { key: "last_status_change_from", label: "Mudança status ≥", value: lastStatusChangeFrom, setter: setLastStatusChangeFrom },
    { key: "last_status_change_to", label: "Mudança status ≤", value: lastStatusChangeTo, setter: setLastStatusChangeTo },
    { key: "last_reset_from", label: "Último reset ≥", value: lastResetFrom, setter: setLastResetFrom },
    { key: "last_reset_to", label: "Último reset ≤", value: lastResetTo, setter: setLastResetTo },
    { key: "date_deleted_from", label: "Deletado ≥", value: dateDeletedFrom, setter: setDateDeletedFrom },
    { key: "date_deleted_to", label: "Deletado ≤", value: dateDeletedTo, setter: setDateDeletedTo },
  ];

  const { talents, total, isLoading, isError, errorDetail } = useTalents({
    page,
    limit,
    sort,
    email: searchEmail,
    q: generalQ,
    department,
    departments: departments.join(","),
    orchestrator,
    orchestrators: orchestrators.join(","),
    orchestrator_null: orchestratorNull ? true : undefined,
    pdi,
    status: statuses.join(","),
    id,
    userId,
    phone,
    verifiedPhone,
    onlyVerifiedPhone: onlyVerifiedPhone ? true : undefined,
    graduationCourse: gradCourse,
    graduationCourses: coursesSel.join(","),
    graduationInstitution: gradInst,
    graduationInstitutions: instSel.join(","),
    leaderId,
    leaders: leaders.join(","),
    roleId: targetRoleId,
    roles: roles.join(","),
    noLeader: noLeader ? true : undefined,
    noRole: noRole ? true : undefined,
    currentCycle,
    currentCycleId,
    resetCountMin: resetMin,
    resetCountMax: resetMax,
    currentCycleMin: cycleMin,
    currentCycleMax: cycleMax,
    dateCreatedFrom,
    dateCreatedTo,
    dateUpdatedFrom,
    dateUpdatedTo,
    dateDeletedFrom,
    dateDeletedTo,
    dateDeletedIsNull: deletedFilter === "only" ? "false" : undefined,
    withDeleted: deletedFilter === "include" ? true : undefined,
    startFrom: startDateFrom,
    startTo: startDateTo,
    endFrom: endDateFrom,
    endTo: endDateTo,
    activeFrom: activeFrom || undefined,
    activeTo: activeTo || undefined,
    lastStatusChangeFrom,
    lastStatusChangeTo,
    lastResetFrom,
    lastResetTo,
  });

  const resetFilters = () => {
    setPage(1);
    setSort("-date_updated");
    setSearchEmail("");
    setGeneralQ("");
    setDepartment("");
    setDepartments([]);
    setOrchestrator("");
    setOrchestrators([]);
    setOrchestratorNull(false);
    setPdi("");
    setStatuses([]);
    setId("");
    setUserId("");
    setPhone("");
    setVerifiedPhone("");
    setOnlyVerifiedPhone(false);
    setGradCourse("");
    setGradInst("");
    setCoursesSel([]);
    setInstSel([]);
    setLeaderId("");
    setLeaders([]);
    setTargetRoleId("");
    setRoles([]);
    setNoLeader(false);
    setNoRole(false);
    setCurrentCycle("");
    setCurrentCycleId("");
    setActiveFrom("");
    setActiveTo("");
    setResetMin("");
    setResetMax("");
    setCycleMin("");
    setCycleMax("");
    setDateCreatedFrom("");
    setDateCreatedTo("");
    setDateUpdatedFrom("");
    setDateUpdatedTo("");
    setDateDeletedFrom("");
    setDateDeletedTo("");
    setDeletedFilter("active");
    setStartDateFrom("");
    setStartDateTo("");
    setEndDateFrom("");
    setEndDateTo("");
    setLastStatusChangeFrom("");
    setLastStatusChangeTo("");
    setLastResetFrom("");
    setLastResetTo("");
  };

  return (
    <main className="p-4 max-w-[1200px] mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Talentos</h1>
        <p className="text-sm text-gray-600">
          Lista com filtros, busca por email, paginação server-side.
        </p>
      </header>

      <section className="flex flex-wrap gap-4 items-end border rounded-lg p-4 bg-gray-50">
        <div className="w-full flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Busca geral</label>
          <input
            className="rounded border px-3 py-2 text-sm w-full"
            placeholder="Busque por departamento, curso, instituição, líder, cargo ..."
            value={generalQ}
            onChange={(e) => {
              setPage(1);
              setGeneralQ(e.target.value);
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Curso(s)</label>
          <MultiCheckboxDropdown
            label="Cursos"
            values={(coursesDistinct?.data ?? []).map((c) => ({ value: c, label: c }))}
            selected={coursesSel}
            onChange={(next) => {
              setPage(1);
              setCoursesSel(next);
              setGradCourse("");
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Instituição(ões)</label>
          <MultiCheckboxDropdown
            label="Instituições"
            values={(institutionsDistinct?.data ?? []).map((i) => ({ value: i, label: i }))}
            selected={instSel}
            onChange={(next) => {
              setPage(1);
              setInstSel(next);
              setGradInst("");
            }}
          />
        </div>

        {/* Current Cycle range */}
        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Ciclo atual (faixa)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              className="rounded border px-2 py-1 w-24"
              placeholder="mín"
              value={cycleMin}
              onChange={(e) => {
                setPage(1);
                setCycleMin(e.target.value);
              }}
            />
            <span className="text-gray-500">–</span>
            <input
              type="number"
              min={1}
              className="rounded border px-2 py-1 w-24"
              placeholder="máx"
              value={cycleMax}
              onChange={(e) => {
                setPage(1);
                setCycleMax(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Chips: Vigência rápida */}
        <div className="flex flex-col text-sm">
          <label className="font-medium">Vigência rápida</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            <button
              className="rounded border px-2 py-1 text-xs bg-white hover:bg-gray-100"
              onClick={() => {
                setPage(1);
                setActiveFrom(fmt(today));
                setActiveTo(fmt(today));
                setStartDateFrom("");
                setStartDateTo("");
                setEndDateFrom("");
                setEndDateTo("");
              }}
            >
              Ativos hoje
            </button>
            <button
              className="rounded border px-2 py-1 text-xs bg-white hover:bg-gray-100"
              onClick={() => {
                setPage(1);
                setActiveFrom("");
                setActiveTo("");
                setStartDateFrom(fmt(today));
                setStartDateTo(fmt(addDays(today, 30)));
                setEndDateFrom("");
                setEndDateTo("");
              }}
            >
              Entra nos próximos 30 dias
            </button>
            <button
              className="rounded border px-2 py-1 text-xs bg-white hover:bg-gray-100"
              onClick={() => {
                setPage(1);
                setActiveFrom("");
                setActiveTo("");
                setStartDateFrom("");
                setStartDateTo("");
                setEndDateFrom(fmt(today));
                setEndDateTo(fmt(addDays(today, 30)));
              }}
            >
              Termina nos próximos 30 dias
            </button>
          </div>
        </div>

        
        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Buscar por e-mail</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            placeholder="ex: bruno.talent@example.com"
            value={searchEmail}
            onChange={(e) => {
              setPage(1);
              setSearchEmail(e.target.value);
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Departamentos</label>
          <MultiCheckboxDropdown
            label="Departamentos"
            values={["Engineering","Design","Product","Marketing","Operations"].map((d) => ({ value: d, label: d }))}
            selected={departments}
            onChange={(next) => {
              setPage(1);
              setDepartments(next);
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Orchestrator</label>
          <MultiCheckboxDropdown
            label="Orchestrator"
            values={["ACTIVE","ONBOARDING","PENDING"].map((o) => ({ value: o, label: o }))}
            selected={orchestrators}
            onChange={(next) => {
              setPage(1);
              setOrchestrator("");
              setOrchestratorNull(false);
              setOrchestrators(next);
            }}
            footer={
              <label className="flex items-center gap-2 text-sm px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={orchestratorNull}
                  onChange={(e) => {
                    setPage(1);
                    setOrchestratorNull(e.target.checked);
                    if (e.target.checked) {
                      setOrchestrator("");
                      setOrchestrators([]);
                    }
                  }}
                />
                Sem estado
              </label>
            }
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">PDI pronto?</label>
          <MultiCheckboxDropdown
            label="PDI"
            values={[{ value: "true", label: "Sim" }, { value: "false", label: "Não" }]}
            selected={pdi ? [pdi] : []}
            onChange={(next) => {
              setPage(1);
              if (next.length === 1) setPdi(next[0]);
              else setPdi("");
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Status</label>
          <MultiCheckboxDropdown
            label="Status"
            values={["ACTIVE","PENDING_FIRST_ACCESS","INACTIVE","ONBOARDING"].map((s) => ({ value: s, label: s }))}
            selected={statuses}
            onChange={(next) => {
              setPage(1);
              setStatuses(next);
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Líder</label>
          <MultiCheckboxDropdown
            label="Líder"
            values={(leadersList?.data ?? []).map((l) => ({
              value: String(l.id),
              label: String(l.id) + " - " + (l.position ?? "?") + (l.department ? " / " + l.department : ""),
            }))}
            selected={leaders}
            onChange={(next) => {
              setPage(1);
              setLeaders(next);
            }}
            footer={
              <label className="flex items-center gap-2 text-sm px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={noLeader}
                  onChange={(e) => {
                    setPage(1);
                    setNoLeader(e.target.checked);
                  }}
                />
                Sem líder
              </label>
            }
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Cargo alvo</label>
          <MultiCheckboxDropdown
            label="Cargo alvo"
            values={(rolesList?.data ?? []).map((r) => ({ value: String(r.id), label: r.name }))}
            selected={roles}
            onChange={(next) => {
              setPage(1);
              setRoles(next);
            }}
            footer={
              <label className="flex items-center gap-2 text-sm px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={noRole}
                  onChange={(e) => {
                    setPage(1);
                    setNoRole(e.target.checked);
                  }}
                />
                Sem cargo alvo
              </label>
            }
          />
        </div>

        <details className="w-full">
          <summary className="cursor-pointer text-sm text-gray-700 font-medium my-2">
            Filtros avançados
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col text-sm">
              <label className="font-medium">ID (talent.id)</label>
              <input
                className="rounded border px-2 py-1"
                value={id}
                onChange={(e) => {
                  setPage(1);
                  setId(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">User ID (UUID)</label>
              <input
                className="rounded border px-2 py-1"
                value={userId}
                onChange={(e) => {
                  setPage(1);
                  setUserId(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Current Cycle ID (UUID)</label>
              <input
                className="rounded border px-2 py-1"
                value={currentCycleId}
                onChange={(e) => {
                  setPage(1);
                  setCurrentCycleId(e.target.value);
                }}
              />
            </div>

            <div className="flex flex-col text-sm">
              <label className="font-medium">Telefone</label>
              <input
                className="rounded border px-2 py-1"
                value={phone}
                onChange={(e) => {
                  setPage(1);
                  setPhone(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Telefone verificado (valor)</label>
              <input
                className="rounded border px-2 py-1"
                value={verifiedPhone}
                onChange={(e) => {
                  setPage(1);
                  setVerifiedPhone(e.target.value);
                }}
              />
            </div>
            

            <div className="flex flex-col text-sm">
              <label className="font-medium">Somente telefones verificados</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={onlyVerifiedPhone}
                  onChange={(e) => {
                    setPage(1);
                    setOnlyVerifiedPhone(e.target.checked);
                  }}
                />
                <span className="text-xs text-gray-600">
                  Oculta registros sem número validado
                </span>
              </div>
            </div>
            

            <div className="flex flex-col text-sm">
              <label className="font-medium">Reset count (min)</label>
              <input
                type="number"
                className="rounded border px-2 py-1"
                value={resetMin}
                onChange={(e) => {
                  setPage(1);
                  setResetMin(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Reset count (max)</label>
              <input
                type="number"
                className="rounded border px-2 py-1"
                value={resetMax}
                onChange={(e) => {
                  setPage(1);
                  setResetMax(e.target.value);
                }}
              />
            </div>
            

            {dateFieldConfigs.map(({ key, label, value, setter }) => (
              <div key={key} className="flex flex-col text-sm">
                <label className="font-medium">{label}</label>
                <input
                  type="date"
                  className="rounded border px-2 py-1"
                  value={value}
                  onChange={(e) => {
                    setPage(1);
                    setter(e.target.value);
                  }}
                />
              </div>
            ))}

            
            <div className="flex flex-col text-sm">
              <label className="font-medium">Registros excluídos</label>
              <select
                className="rounded border px-2 py-1"
                value={deletedFilter}
                onChange={(e) => {
                  setPage(1);
                  setDeletedFilter(e.target.value as "active" | "include" | "only");
                }}
              >
                <option value="active">Ocultar excluídos (padrão)</option>
                <option value="include">Incluir excluídos</option>
                <option value="only">Somente excluídos</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Soft delete é filtrado automaticamente; ajuste se precisar auditar exclusões.
              </p>
            </div>
          </div>
        </details>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col text-sm">
            <label className="text-sm text-gray-700">Ordenar: Atualizado</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={sort === "date_updated" ? "asc" : sort === "-date_updated" ? "desc" : ""}
              onChange={(e) => {
                setPage(1);
                const v = e.target.value;
                setSort(v === "asc" ? "date_updated" : v === "desc" ? "-date_updated" : "-date_updated");
              }}
            >
              <option value="">(—)</option>
              <option value="asc">Mais antigo</option>
              <option value="desc">Mais recente</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Por página</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="ml-auto rounded border px-3 py-1.5 text-sm bg-white hover:bg-gray-100"
        >
          Limpar filtros
        </button>
      </section>

      <TalentsTable
        talents={talents}
        isLoading={isLoading}
        isError={isError}
        errorDetail={errorDetail}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        sort={sort}
        onSortChange={(s) => {
          setPage(1);
          setSort(s);
        }}
      />
    </main>
  );
}
