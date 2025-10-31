// src/app/page.tsx
"use client";

import { useState } from "react";
import { useTalents } from "@/hooks/useTalents";
import { TalentsTable } from "@/components/TalentsTable";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchEmail, setSearchEmail] = useState(""); // e-mail
  const [generalQ, setGeneralQ] = useState(""); // geral (search=)
  const [department, setDepartment] = useState("");
  const [orchestrator, setOrchestrator] = useState("");
  const [pdi, setPdi] = useState("");
  const [id, setId] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [gradCourse, setGradCourse] = useState("");
  const [gradInst, setGradInst] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [targetRoleId, setTargetRoleId] = useState("");
  const [currentCycle, setCurrentCycle] = useState("");
  const [currentCycleId, setCurrentCycleId] = useState("");

  // números (range)
  const [resetMin, setResetMin] = useState("");
  const [resetMax, setResetMax] = useState("");
  const [cycleMin, setCycleMin] = useState("");
  const [cycleMax, setCycleMax] = useState("");

  // Datas (range)
  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  const [dateUpdatedFrom, setDateUpdatedFrom] = useState("");
  const [dateUpdatedTo, setDateUpdatedTo] = useState("");
  const [dateDeletedFrom, setDateDeletedFrom] = useState("");
  const [dateDeletedTo, setDateDeletedTo] = useState("");
  const [dateDeletedIsNull, setDateDeletedIsNull] = useState(""); // "", "true", "false"
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");
  const [lastStatusChangeFrom, setLastStatusChangeFrom] = useState("");
  const [lastStatusChangeTo, setLastStatusChangeTo] = useState("");
  const [lastResetFrom, setLastResetFrom] = useState("");
  const [lastResetTo, setLastResetTo] = useState("");
  const { talents, total, isLoading, isError, errorDetail } = useTalents({
    page,
    limit,
    email: searchEmail,
    q: generalQ,
    department,
    orchestrator_state: orchestrator,
    pdi_plan_ready: pdi,
    id,
    user_id: userId,
    phone_number: phone,
    verified_phone_number: verifiedPhone,
    graduation_course: gradCourse,
    graduation_institution: gradInst,
    current_status: currentStatus,
    leader_id: leaderId,
    target_role_id: targetRoleId,
    current_cycle: currentCycle,
    current_cycle_id: currentCycleId,
    // números
    reset_count_min: resetMin,
    reset_count_max: resetMax,
    current_cycle_min: cycleMin,
    current_cycle_max: cycleMax,
    // datas
    date_created_from: dateCreatedFrom,
    date_created_to: dateCreatedTo,
    date_updated_from: dateUpdatedFrom,
    date_updated_to: dateUpdatedTo,
    date_deleted_from: dateDeletedFrom,
    date_deleted_to: dateDeletedTo,
    date_deleted_is_null: dateDeletedIsNull,
    start_date_from: startDateFrom,
    start_date_to: startDateTo,
    end_date_from: endDateFrom,
    end_date_to: endDateTo,
    last_status_change_from: lastStatusChangeFrom,
    last_status_change_to: lastStatusChangeTo,
    last_reset_from: lastResetFrom,
    last_reset_to: lastResetTo,
  });

  const resetFilters = () => {
    setPage(1);
    setSearchEmail("");
    setGeneralQ("");
    setDepartment("");
    setOrchestrator("");
    setPdi("");
    setId("");
    setUserId("");
    setPhone("");
    setVerifiedPhone("");
    +setGradCourse("");
    setGradInst("");
    +setCurrentStatus("");
    setLeaderId("");
    setTargetRoleId("");
    +setCurrentCycle("");
    setCurrentCycleId("");
    +setResetMin("");
    setResetMax("");
    setCycleMin("");
    setCycleMax("");
    +setDateCreatedFrom("");
    setDateCreatedTo("");
    +setDateUpdatedFrom("");
    setDateUpdatedTo("");
    +setDateDeletedFrom("");
    setDateDeletedTo("");
    setDateDeletedIsNull("");
    +setStartDateFrom("");
    setStartDateTo("");
    +setEndDateFrom("");
    setEndDateTo("");
    +setLastStatusChangeFrom("");
    setLastStatusChangeTo("");
    +setLastResetFrom("");
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

      {/* filtros */}
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
              <label className="font-medium">Telefone verificado</label>
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
              <label className="font-medium">Status atual</label>
              <select
                className="rounded border px-2 py-1"
                value={currentStatus}
                onChange={(e) => {
                  setPage(1);
                  setCurrentStatus(e.target.value);
                }}
              >
                <option value="">(todos)</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_FIRST_ACCESS">
                  PENDING_FIRST_ACCESS
                </option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ONBOARDING">ONBOARDING</option>
              </select>
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

            {/* Números */}
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

            {/* Datas: use date (dia) para simplificar; se quiser use datetime-local */}
            {[
              [
                "date_created_from",
                "Criado ≥",
                dateCreatedFrom,
                setDateCreatedFrom,
              ],
              ["date_created_to", "Criado ≤", dateCreatedTo, setDateCreatedTo],
              [
                "date_updated_from",
                "Atualizado ≥",
                dateUpdatedFrom,
                setDateUpdatedFrom,
              ],
              [
                "date_updated_to",
                "Atualizado ≤",
                dateUpdatedTo,
                setDateUpdatedTo,
              ],
              ["start_date_from", "Início ≥", startDateFrom, setStartDateFrom],
              ["start_date_to", "Início ≤", startDateTo, setStartDateTo],
              ["end_date_from", "Fim ≥", endDateFrom, setEndDateFrom],
              ["end_date_to", "Fim ≤", endDateTo, setEndDateTo],
              [
                "last_status_change_from",
                "Mudança status ≥",
                lastStatusChangeFrom,
                setLastStatusChangeFrom,
              ],
              [
                "last_status_change_to",
                "Mudança status ≤",
                lastStatusChangeTo,
                setLastStatusChangeTo,
              ],
              [
                "last_reset_from",
                "Último reset ≥",
                lastResetFrom,
                setLastResetFrom,
              ],
              ["last_reset_to", "Último reset ≤", lastResetTo, setLastResetTo],
              [
                "date_deleted_from",
                "Deletado ≥",
                dateDeletedFrom,
                setDateDeletedFrom,
              ],
              [
                "date_deleted_to",
                "Deletado ≤",
                dateDeletedTo,
                setDateDeletedTo,
              ],
            ].map(([key, label, val, setter]) => (
              <div key={key as string} className="flex flex-col text-sm">
                <label className="font-medium">{label as string}</label>
                <input
                  type="date"
                  className="rounded border px-2 py-1"
                  value={val as string}
                  onChange={(e) => {
                    setPage(1);
                    (setter as any)(e.target.value);
                  }}
                />
              </div>
            ))}
            <div className="flex flex-col text-sm">
              <label className="font-medium">Deletado é nulo?</label>
              <select
                className="rounded border px-2 py-1"
                value={dateDeletedIsNull}
                onChange={(e) => {
                  setPage(1);
                  setDateDeletedIsNull(e.target.value);
                }}
              >
                <option value="">(ignorar)</option>
                <option value="true">Sim (apenas nulos)</option>
                <option value="false">Não (apenas não-nulos)</option>
              </select>
            </div>
          </div>
        </details>
        

        

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
