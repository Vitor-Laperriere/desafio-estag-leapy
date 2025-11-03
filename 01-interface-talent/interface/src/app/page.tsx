"use client";

// @improved Refactored talents list page with modern UI, accessible filters, and responsive layout
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { FiltersBar, type FilterChip, type Option } from "./_components/FiltersBar";
import { useTalents } from "@/hooks/useTalents";
import { TalentsTable } from "@/modules/talent/ui/components/TalentsTable";

const DEPARTMENT_OPTIONS: Option[] = ["Engineering", "Design", "Product", "Marketing", "Operations"].map(
  (dept) => ({ value: dept, label: dept })
);
const ORCHESTRATOR_OPTIONS: Option[] = ["ACTIVE", "ONBOARDING", "PENDING"].map((value) => ({ value, label: value }));
const STATUS_OPTIONS: Option[] = [
  "ACTIVE",
  "PENDING_FIRST_ACCESS",
  "INACTIVE",
  "ONBOARDING",
].map((value) => ({ value, label: value }));

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export default function HomePage() {
  const filtersRef = useRef<HTMLDivElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date_updated");

  // primary filters
  const [generalQuery, setGeneralQuery] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [orchestrators, setOrchestrators] = useState<string[]>([]);
  const [orchestratorNull, setOrchestratorNull] = useState(false);
  const [pdi, setPdi] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [leaders, setLeaders] = useState<string[]>([]);
  const [noLeader, setNoLeader] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [noRole, setNoRole] = useState(false);
  const [cycles, setCycles] = useState<string[]>([]);
  const [matchThreshold, setMatchThreshold] = useState(0);
  const [startFrom, setStartFrom] = useState("");
  const [startTo, setStartTo] = useState("");
  const [endFrom, setEndFrom] = useState("");
  const [endTo, setEndTo] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");

  // advanced filters
  const [id, setId] = useState("");
  const [userId, setUserId] = useState("");
  const [currentCycleId, setCurrentCycleId] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [onlyVerifiedPhone, setOnlyVerifiedPhone] = useState(false);
  const [resetMin, setResetMin] = useState("");
  const [resetMax, setResetMax] = useState("");
  const [currentCycle, setCurrentCycle] = useState("");
  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  const [dateUpdatedFrom, setDateUpdatedFrom] = useState("");
  const [dateUpdatedTo, setDateUpdatedTo] = useState("");
  const [lastStatusChangeFrom, setLastStatusChangeFrom] = useState("");
  const [lastStatusChangeTo, setLastStatusChangeTo] = useState("");
  const [lastResetFrom, setLastResetFrom] = useState("");
  const [lastResetTo, setLastResetTo] = useState("");
  const [dateDeletedFrom, setDateDeletedFrom] = useState("");
  const [dateDeletedTo, setDateDeletedTo] = useState("");
  const [deletedFilter, setDeletedFilter] = useState<"active" | "include" | "only">("active");

  const { data: coursesDistinct } = useSWR<{ data: string[] }>(
    "/api/distinct?collection=talents&field=graduation_course",
    (url) => fetch(url).then((response) => response.json()),
    { revalidateOnFocus: false }
  );
  const { data: cyclesDistinct } = useSWR<{ data: (string | number)[] }>(
    "/api/distinct?collection=talents&field=current_cycle",
    (url) => fetch(url).then((response) => response.json()),
    { revalidateOnFocus: false }
  );
  const { data: institutionsDistinct } = useSWR<{ data: string[] }>(
    "/api/distinct?collection=talents&field=graduation_institution",
    (url) => fetch(url).then((response) => response.json()),
    { revalidateOnFocus: false }
  );
  const { data: leadersList } = useSWR<{ data: { id: number; position?: string; department?: string }[] }>(
    "/api/leaders",
    (url) => fetch(url).then((response) => response.json()),
    { revalidateOnFocus: false }
  );
  const { data: rolesList } = useSWR<{ data: { id: number; name: string }[] }>(
    "/api/roles",
    (url) => fetch(url).then((response) => response.json()),
    { revalidateOnFocus: false }
  );

  const leaderOptions: Option[] = useMemo(
    () =>
      (leadersList?.data ?? []).map((leader) => ({
        value: String(leader.id),
        label:
          String(leader.id) +
          " - " +
          (leader.position ?? "?") +
          (leader.department ? ` / ${leader.department}` : ""),
      })),
    [leadersList]
  );

  const roleOptions: Option[] = useMemo(
    () => (rolesList?.data ?? []).map((role) => ({ value: String(role.id), label: role.name })),
    [rolesList]
  );

  const cycleOptions = useMemo(() => {
    const raw = cyclesDistinct?.data ?? [];
    const seen = new Set<string>();
    const values: string[] = [];
    for (const item of raw) {
      const value = String(item).trim();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      values.push(value);
    }
    if (values.length === 0) {
      return Array.from({ length: 12 }, (_, index) => String(index + 1));
    }
    return values.sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      const aIsNumber = Number.isFinite(numA);
      const bIsNumber = Number.isFinite(numB);
      if (aIsNumber && bIsNumber) return numA - numB;
      if (aIsNumber) return -1;
      if (bIsNumber) return 1;
      return a.localeCompare(b);
    });
  }, [cyclesDistinct]);

  const cycleBounds = useMemo(() => {
    if (!cycles.length) return { min: "", max: "" };
    const numericValues = cycles
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)) as number[];
    if (!numericValues.length) return { min: "", max: "" };
    return {
      min: String(Math.min(...numericValues)),
      max: String(Math.max(...numericValues)),
    };
  }, [cycles]);

  const resetFilters = useCallback(() => {
    setPage(1);
    setGeneralQuery("");
    setSearchEmail("");
    setDepartments([]);
    setOrchestrators([]);
    setOrchestratorNull(false);
    setPdi("");
    setStatuses([]);
    setCourses([]);
    setInstitutions([]);
    setLeaders([]);
    setNoLeader(false);
    setRoles([]);
    setNoRole(false);
    setCycles([]);
    setMatchThreshold(0);
    setStartFrom("");
    setStartTo("");
    setEndFrom("");
    setEndTo("");
    setActiveFrom("");
    setActiveTo("");
    setId("");
    setUserId("");
    setCurrentCycleId("");
    setPhone("");
    setVerifiedPhone("");
    setOnlyVerifiedPhone(false);
    setResetMin("");
    setResetMax("");
    setCurrentCycle("");
    setDateCreatedFrom("");
    setDateCreatedTo("");
    setDateUpdatedFrom("");
    setDateUpdatedTo("");
    setLastStatusChangeFrom("");
    setLastStatusChangeTo("");
    setLastResetFrom("");
    setLastResetTo("");
    setDateDeletedFrom("");
    setDateDeletedTo("");
    setDeletedFilter("active");
  }, []);

  useEffect(() => {
    const handleAdd = () => {
      setShowAdvanced(true);
      filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const handleReset = () => resetFilters();

    window.addEventListener("filters:add", handleAdd as EventListener);
    window.addEventListener("filters:reset", handleReset as EventListener);
    return () => {
      window.removeEventListener("filters:add", handleAdd as EventListener);
      window.removeEventListener("filters:reset", handleReset as EventListener);
    };
  }, [resetFilters]);

  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    if (generalQuery.trim()) {
      chips.push({
        id: "generalQuery",
        label: "Busca",
        value: generalQuery,
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setGeneralQuery("");
        },
      });
    }
    if (searchEmail.trim()) {
      chips.push({
        id: "email",
        label: "Email",
        value: searchEmail,
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setSearchEmail("");
        },
      });
    }
    if (departments.length) {
      chips.push({
        id: "departments",
        label: "Departamentos",
        value: departments.join(", "),
        variant: "primary",
        onRemove: () => {
          setPage(1);
          setDepartments([]);
        },
      });
    }
    if (orchestrators.length || orchestratorNull) {
      chips.push({
        id: "orchestrator",
        label: "Orchestrator",
        value: orchestratorNull
          ? "Sem estado"
          : orchestrators.join(", "),
        variant: orchestratorNull ? "secondary" : "accent",
        onRemove: () => {
          setPage(1);
          setOrchestrators([]);
          setOrchestratorNull(false);
        },
      });
    }
    if (pdi) {
      chips.push({
        id: "pdi",
        label: "PDI",
        value: pdi === "true" ? "Sim" : "Não",
        variant: pdi === "true" ? "primary" : "secondary",
        onRemove: () => {
          setPage(1);
          setPdi("");
        },
      });
    }
    if (statuses.length) {
      chips.push({
        id: "statuses",
        label: "Status",
        value: statuses.join(", "),
        variant: "secondary",
        onRemove: () => {
          setPage(1);
          setStatuses([]);
        },
      });
    }
    if (courses.length) {
      chips.push({
        id: "courses",
        label: "Cursos",
        value: courses.join(", "),
        variant: "primary",
        onRemove: () => {
          setPage(1);
          setCourses([]);
        },
      });
    }
    if (institutions.length) {
      chips.push({
        id: "institutions",
        label: "Instituições",
        value: institutions.join(", "),
        variant: "primary",
        onRemove: () => {
          setPage(1);
          setInstitutions([]);
        },
      });
    }
    if (leaders.length || noLeader) {
      chips.push({
        id: "leaders",
        label: "Líder",
        value: noLeader ? "Sem líder" : leaders.join(", "),
        variant: noLeader ? "secondary" : "accent",
        onRemove: () => {
          setPage(1);
          setLeaders([]);
          setNoLeader(false);
        },
      });
    }
    if (roles.length || noRole) {
      chips.push({
        id: "roles",
        label: "Cargo alvo",
        value: noRole ? "Sem cargo" : roles.join(", "),
        variant: noRole ? "secondary" : "accent",
        onRemove: () => {
          setPage(1);
          setRoles([]);
          setNoRole(false);
        },
      });
    }
    if (cycles.length) {
      chips.push({
        id: "cycles",
        label: "Ciclo",
        value: cycles.join(", "),
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setCycles([]);
        },
      });
    }
    if (matchThreshold > 0) {
      chips.push({
        id: "match",
        label: "Match",
        value: `≥ ${matchThreshold}%`,
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setMatchThreshold(0);
        },
      });
    }
    if (startFrom || startTo) {
      chips.push({
        id: "start-range",
        label: "Início",
        value: `${startFrom || "–"} a ${startTo || "–"}`,
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setStartFrom("");
          setStartTo("");
        },
      });
    }
    if (endFrom || endTo) {
      chips.push({
        id: "end-range",
        label: "Fim",
        value: `${endFrom || "–"} a ${endTo || "–"}`,
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setEndFrom("");
          setEndTo("");
        },
      });
    }
    if (activeFrom || activeTo) {
      chips.push({
        id: "active-range",
        label: "Vigência rápida",
        value: `${activeFrom || "–"} a ${activeTo || "–"}`,
        variant: "accent",
        onRemove: () => {
          setPage(1);
          setActiveFrom("");
          setActiveTo("");
        },
      });
    }
    if (deletedFilter !== "active") {
      chips.push({
        id: "deleted",
        label: "Soft delete",
        value:
          deletedFilter === "include" ? "Incluir excluídos" : "Somente excluídos",
        variant: "secondary",
        onRemove: () => {
          setPage(1);
          setDeletedFilter("active");
        },
      });
    }
    return chips;
  }, [
    courses,
    cycles,
    deletedFilter,
    departments,
    endFrom,
    endTo,
    generalQuery,
    institutions,
    leaders,
    noLeader,
    noRole,
    orchestratorNull,
    orchestrators,
    pdi,
    roles,
    searchEmail,
    startFrom,
    startTo,
    statuses,
    activeFrom,
    activeTo,
    matchThreshold,
  ]);

  const handleActiveToday = useCallback(() => {
    const now = new Date();
    setPage(1);
    setActiveFrom(formatDate(now));
    setActiveTo(formatDate(now));
    setStartFrom("");
    setStartTo("");
    setEndFrom("");
    setEndTo("");
  }, []);

  const handleIncoming30 = useCallback(() => {
    const now = new Date();
    setPage(1);
    setActiveFrom("");
    setActiveTo("");
    setStartFrom(formatDate(now));
    setStartTo(formatDate(addDays(now, 30)));
    setEndFrom("");
    setEndTo("");
  }, []);

  const handleEnding30 = useCallback(() => {
    const now = new Date();
    setPage(1);
    setActiveFrom("");
    setActiveTo("");
    setStartFrom("");
    setStartTo("");
    setEndFrom(formatDate(now));
    setEndTo(formatDate(addDays(now, 30)));
  }, []);

  const matchMinParam = matchThreshold > 0 ? Number((matchThreshold / 100).toFixed(2)) : undefined;

  const { talents, total, isLoading, isError, errorDetail } = useTalents({
    page,
    limit,
    sort,
    email: searchEmail,
    q: generalQuery,
    department: "",
    departments: departments.join(","),
    orchestrator: "",
    orchestrators: orchestrators.join(","),
    orchestrator_null: orchestratorNull ? true : undefined,
    pdi,
    status: statuses.join(","),
    leaderId: "",
    leaders: leaders.join(","),
    roleId: "",
    roles: roles.join(","),
    noLeader: noLeader ? true : undefined,
    noRole: noRole ? true : undefined,
    currentCycleMin: cycleBounds.min,
    currentCycleMax: cycleBounds.max,
    startFrom,
    startTo,
    endFrom,
    endTo,
    activeFrom: activeFrom || undefined,
    activeTo: activeTo || undefined,
    id,
    userId,
    currentCycleId,
    phone,
    verifiedPhone,
    onlyVerifiedPhone: onlyVerifiedPhone ? true : undefined,
    resetCountMin: resetMin,
    resetCountMax: resetMax,
    currentCycle,
    graduationCourse: "",
    graduationCourses: courses.join(","),
    graduationInstitution: "",
    graduationInstitutions: institutions.join(","),
    dateCreatedFrom,
    dateCreatedTo,
    dateUpdatedFrom,
    dateUpdatedTo,
    lastStatusChangeFrom,
    lastStatusChangeTo,
    lastResetFrom,
    lastResetTo,
    dateDeletedFrom,
    dateDeletedTo,
    dateDeletedIsNull: deletedFilter === "only" ? "false" : undefined,
    withDeleted:
      deletedFilter === "include" || deletedFilter === "only" ? true : undefined,
    matchMin: matchMinParam,
  });

  const advancedContent = (
    <>
      <AdvancedInput label="ID (talent)" value={id} onChange={(value) => { setPage(1); setId(value); }} />
      <AdvancedInput label="User ID" value={userId} onChange={(value) => { setPage(1); setUserId(value); }} />
      <AdvancedInput label="Current cycle ID" value={currentCycleId} onChange={(value) => { setPage(1); setCurrentCycleId(value); }} />
      <AdvancedInput label="Telefone" value={phone} onChange={(value) => { setPage(1); setPhone(value); }} />
      <AdvancedInput label="Telefone verificado" value={verifiedPhone} onChange={(value) => { setPage(1); setVerifiedPhone(value); }} />
      <label
        className="filter-flag"
        data-active={onlyVerifiedPhone ? "true" : undefined}
      >
        <input
          type="checkbox"
          className="rounded border-[var(--color-border)] bg-[var(--color-soft)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
          checked={onlyVerifiedPhone}
          onChange={(event) => {
            setPage(1);
            setOnlyVerifiedPhone(event.target.checked);
          }}
        />
        Somente telefones verificados
      </label>
      <AdvancedInput
        label="Reset count (mínimo)"
        type="number"
        value={resetMin}
        onChange={(value) => {
          setPage(1);
          setResetMin(value);
        }}
      />
      <AdvancedInput
        label="Reset count (máximo)"
        type="number"
        value={resetMax}
        onChange={(value) => {
          setPage(1);
          setResetMax(value);
        }}
      />
      <AdvancedInput
        label="Ciclo atual (exato)"
        type="number"
        value={currentCycle}
        onChange={(value) => {
          setPage(1);
          setCurrentCycle(value);
        }}
      />
      <AdvancedInput
        label="Criado a partir de"
        type="date"
        value={dateCreatedFrom}
        onChange={(value) => {
          setPage(1);
          setDateCreatedFrom(value);
        }}
      />
      <AdvancedInput
        label="Criado até"
        type="date"
        value={dateCreatedTo}
        onChange={(value) => {
          setPage(1);
          setDateCreatedTo(value);
        }}
      />
      <AdvancedInput
        label="Atualizado a partir de"
        type="date"
        value={dateUpdatedFrom}
        onChange={(value) => {
          setPage(1);
          setDateUpdatedFrom(value);
        }}
      />
      <AdvancedInput
        label="Atualizado até"
        type="date"
        value={dateUpdatedTo}
        onChange={(value) => {
          setPage(1);
          setDateUpdatedTo(value);
        }}
      />
      <AdvancedInput
        label="Mudança status a partir de"
        type="date"
        value={lastStatusChangeFrom}
        onChange={(value) => {
          setPage(1);
          setLastStatusChangeFrom(value);
        }}
      />
      <AdvancedInput
        label="Mudança status até"
        type="date"
        value={lastStatusChangeTo}
        onChange={(value) => {
          setPage(1);
          setLastStatusChangeTo(value);
        }}
      />
      <AdvancedInput
        label="Último reset a partir de"
        type="date"
        value={lastResetFrom}
        onChange={(value) => {
          setPage(1);
          setLastResetFrom(value);
        }}
      />
      <AdvancedInput
        label="Último reset até"
        type="date"
        value={lastResetTo}
        onChange={(value) => {
          setPage(1);
          setLastResetTo(value);
        }}
      />
      <AdvancedInput
        label="Deletado a partir de"
        type="date"
        value={dateDeletedFrom}
        onChange={(value) => {
          setPage(1);
          setDateDeletedFrom(value);
        }}
      />
      <AdvancedInput
        label="Deletado até"
        type="date"
        value={dateDeletedTo}
        onChange={(value) => {
          setPage(1);
          setDateDeletedTo(value);
        }}
      />
      <label
        className="flex flex-col gap-1 text-sm"
        data-active={deletedFilter !== "active" ? "true" : undefined}
      >
        <span className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">Registros excluídos</span>
        <select
          className="select"
          data-active={deletedFilter !== "active" ? "true" : undefined}
          value={deletedFilter}
          onChange={(event) => {
            setPage(1);
            setDeletedFilter(event.target.value as "active" | "include" | "only");
          }}
        >
          <option value="active">Ocultar excluídos (padrão)</option>
          <option value="include">Incluir excluídos</option>
          <option value="only">Somente excluídos</option>
        </select>
      </label>
    </>
  );

  const coursesOptions = coursesDistinct?.data ?? [];
  const institutionsOptions = institutionsDistinct?.data ?? [];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <FiltersBar
        innerRef={filtersRef}
        resultCount={total}
        isLoading={isLoading}
        chips={filterChips}
        sort={sort}
        onSortChange={(value) => {
          setPage(1);
          setSort(value);
        }}
        onReset={resetFilters}
        values={{
          generalQuery,
          email: searchEmail,
          courses,
          cycles,
          match: matchThreshold,
          institutions,
          departments,
          orchestrators,
          orchestratorNull,
          pdi,
          statuses,
          leaders,
          noLeader,
          roles,
          noRole,
          startFrom,
          startTo,
          endFrom,
          endTo,
          activeFrom,
          activeTo,
        }}
        handlers={{
          onGeneralQueryChange: (value) => {
            setPage(1);
            setGeneralQuery(value);
          },
          onEmailChange: (value) => {
            setPage(1);
            setSearchEmail(value);
          },
          onCoursesChange: (next) => {
            setPage(1);
            setCourses(next);
          },
          onInstitutionsChange: (next) => {
            setPage(1);
            setInstitutions(next);
          },
          onDepartmentsChange: (next) => {
            setPage(1);
            setDepartments(next);
          },
          onOrchestratorsChange: (next) => {
            setPage(1);
            setOrchestrators(next);
          },
          onOrchestratorNullChange: (checked) => {
            setPage(1);
            setOrchestratorNull(checked);
            if (checked) setOrchestrators([]);
          },
          onPdiChange: (next) => {
            setPage(1);
            setPdi(next);
          },
          onStatusesChange: (next) => {
            setPage(1);
            setStatuses(next);
          },
          onLeadersChange: (next) => {
            setPage(1);
            setLeaders(next);
          },
          onNoLeaderChange: (checked) => {
            setPage(1);
            setNoLeader(checked);
            if (checked) setLeaders([]);
          },
          onRolesChange: (next) => {
            setPage(1);
            setRoles(next);
          },
          onNoRoleChange: (checked) => {
            setPage(1);
            setNoRole(checked);
            if (checked) setRoles([]);
          },
          onCyclesChange: (next) => {
            setPage(1);
            setCycles(next);
          },
          onMatchChange: (value) => {
            setPage(1);
            setMatchThreshold(value);
          },
          onStartFromChange: (value) => {
            setPage(1);
            setStartFrom(value);
          },
          onStartToChange: (value) => {
            setPage(1);
            setStartTo(value);
          },
          onEndFromChange: (value) => {
            setPage(1);
            setEndFrom(value);
          },
          onEndToChange: (value) => {
            setPage(1);
            setEndTo(value);
          },
        }}
        quickRangeHandlers={{
          today: handleActiveToday,
          incoming30: handleIncoming30,
          ending30: handleEnding30,
        }}
        options={{
          courses: coursesOptions,
          cycles: cycleOptions,
          institutions: institutionsOptions,
          departments: DEPARTMENT_OPTIONS,
          orchestrators: ORCHESTRATOR_OPTIONS,
          statuses: STATUS_OPTIONS,
          leaders: leaderOptions,
          roles: roleOptions,
        }}
        advancedOpen={showAdvanced}
        onAdvancedToggle={(open) => setShowAdvanced(open)}
        advancedContent={advancedContent}
      />

      <section className="card w-full overflow-hidden">
        <TalentsTable
          talents={talents}
          isLoading={isLoading}
          isError={isError}
          errorDetail={errorDetail}
          total={total}
          page={page}
          limit={limit}
          sort={sort}
          onSortChange={(value) => {
            setPage(1);
            setSort(value);
          }}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setPage(1);
            setLimit(value);
          }}
        />
      </section>
    </div>
  );
}

type AdvancedInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

function AdvancedInput({ label, value, onChange, type = "text" }: AdvancedInputProps) {
  const active = value.trim().length > 0;
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm" data-active={active ? "true" : undefined}>
      <span className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">{label}</span>
      <input
        type={type}
        className="input"
        data-active={active ? "true" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
