"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useTalents } from "@/hooks/useTalents";
import { TalentsTable } from "@/modules/talent/ui/components/TalentsTable";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date_updated");

  const [searchEmail, setSearchEmail] = useState("");
  const [generalQ, setGeneralQ] = useState("");
  const [department, setDepartment] = useState("");
  const [orchestrator, setOrchestrator] = useState("");
  const [pdi, setPdi] = useState("");
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [onlyVerifiedPhone, setOnlyVerifiedPhone] = useState(false);
  const [gradCourse, setGradCourse] = useState("");
  const [gradInst, setGradInst] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [targetRoleId, setTargetRoleId] = useState("");
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
    orchestrator,
    pdi,
    status,
    id,
    userId,
    phone,
    verifiedPhone,
    onlyVerifiedPhone: onlyVerifiedPhone ? true : undefined,
    graduationCourse: gradCourse,
    graduationInstitution: gradInst,
    leaderId,
    roleId: targetRoleId,
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
    setOrchestrator("");
    setPdi("");
    setStatus("");
    setId("");
    setUserId("");
    setPhone("");
    setVerifiedPhone("");
    setOnlyVerifiedPhone(false);
    setGradCourse("");
    setGradInst("");
    setLeaderId("");
    setTargetRoleId("");
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
          <label className="text-gray-700 font-medium">Busca geral</label>
          <input
            className="rounded border px-2 py-1 text-sm"
            placeholder="ex: Engineering, Marketing, ACTIVE..."
            value={generalQ}
            onChange={(e) => {
              setPage(1);
              setGeneralQ(e.target.value);
            }}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Departamento</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={department}
            onChange={(e) => {
              setPage(1);
              setDepartment(e.target.value);
            }}
          >
            <option value="">(todos)</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Orchestrator</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={orchestrator}
            onChange={(e) => {
              setPage(1);
              setOrchestrator(e.target.value);
            }}
          >
            <option value="">(todos)</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ONBOARDING">ONBOARDING</option>
            <option value="PENDING">PENDING</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">PDI pronto?</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={pdi}
            onChange={(e) => {
              setPage(1);
              setPdi(e.target.value);
            }}
          >
            <option value="">(todos)</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div className="flex flex-col text-sm">
          <label className="text-gray-700 font-medium">Status</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">(todos)</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING_FIRST_ACCESS">PENDING_FIRST_ACCESS</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ONBOARDING">ONBOARDING</option>
          </select>
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
              <label className="font-medium">Curso</label>
              <input
                className="rounded border px-2 py-1"
                value={gradCourse}
                onChange={(e) => {
                  setPage(1);
                  setGradCourse(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Instituição</label>
              <input
                className="rounded border px-2 py-1"
                value={gradInst}
                onChange={(e) => {
                  setPage(1);
                  setGradInst(e.target.value);
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
              <label className="font-medium">Leader ID</label>
              <input
                className="rounded border px-2 py-1"
                value={leaderId}
                onChange={(e) => {
                  setPage(1);
                  setLeaderId(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Sem líder</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={noLeader}
                  onChange={(e) => {
                    setPage(1);
                    setNoLeader(e.target.checked);
                  }}
                />
                <span className="text-xs text-gray-600">
                  Filtra talentos sem líder associado
                </span>
              </div>
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Target Role ID</label>
              <input
                className="rounded border px-2 py-1"
                value={targetRoleId}
                onChange={(e) => {
                  setPage(1);
                  setTargetRoleId(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Sem cargo alvo</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={noRole}
                  onChange={(e) => {
                    setPage(1);
                    setNoRole(e.target.checked);
                  }}
                />
                <span className="text-xs text-gray-600">
                  Exibe talentos sem cargo alvo vinculado
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
            <div className="flex flex-col text-sm">
              <label className="font-medium">Current cycle (exato)</label>
              <input
                type="number"
                className="rounded border px-2 py-1"
                value={currentCycle}
                onChange={(e) => {
                  setPage(1);
                  setCurrentCycle(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Current cycle (mín)</label>
              <input
                type="number"
                className="rounded border px-2 py-1"
                value={cycleMin}
                onChange={(e) => {
                  setPage(1);
                  setCycleMin(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="font-medium">Current cycle (máx)</label>
              <input
                type="number"
                className="rounded border px-2 py-1"
                value={cycleMax}
                onChange={(e) => {
                  setPage(1);
                  setCycleMax(e.target.value);
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

        <div className="flex flex-col text-sm">
          <label className="text-sm text-gray-700">Ordenar por</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
            <option value="-date_updated">Mais recentes (atualização)</option>
            <option value="-last_status_change_at">Mudanças de status recentes</option>
            <option value="start_date">Início (mais antigo primeiro)</option>
            <option value="end_date">Fim (mais antigo primeiro)</option>
          </select>
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
      />
    </main>
  );
}
