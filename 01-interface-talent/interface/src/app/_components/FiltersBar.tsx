"use client";

// FiltersBar.tsx
// Purpose: accessible filter surface with modern visuals and reusable dropdown controls.
// @improved Consolidated search, multi-selects, and quick actions for the talents table
import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

export type Option = { value: string; label: string };

export type FilterChip = {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
};

type FiltersBarProps = {
  innerRef?: RefObject<HTMLDivElement>;
  resultCount: number;
  isLoading: boolean;
  chips: FilterChip[];
  limit: number;
  sort: string;
  onLimitChange: (limit: number) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  values: {
    generalQuery: string;
    email: string;
    courses: string[];
    institutions: string[];
    departments: string[];
    orchestrators: string[];
    orchestratorNull: boolean;
    pdi: string;
    statuses: string[];
    leaders: string[];
    noLeader: boolean;
    roles: string[];
    noRole: boolean;
    cycleMin: string;
    cycleMax: string;
    startFrom: string;
    startTo: string;
    endFrom: string;
    endTo: string;
  };
  handlers: {
    onGeneralQueryChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onCoursesChange: (values: string[]) => void;
    onInstitutionsChange: (values: string[]) => void;
    onDepartmentsChange: (values: string[]) => void;
    onOrchestratorsChange: (values: string[]) => void;
    onOrchestratorNullChange: (checked: boolean) => void;
    onPdiChange: (value: string) => void;
    onStatusesChange: (values: string[]) => void;
    onLeadersChange: (values: string[]) => void;
    onNoLeaderChange: (checked: boolean) => void;
    onRolesChange: (values: string[]) => void;
    onNoRoleChange: (checked: boolean) => void;
    onCycleMinChange: (value: string) => void;
    onCycleMaxChange: (value: string) => void;
    onStartFromChange: (value: string) => void;
    onStartToChange: (value: string) => void;
    onEndFromChange: (value: string) => void;
    onEndToChange: (value: string) => void;
  };
  quickRangeHandlers: {
    today: () => void;
    incoming30: () => void;
    ending30: () => void;
  };
  options: {
    courses: string[];
    institutions: string[];
    departments: Option[];
    orchestrators: Option[];
    statuses: Option[];
    leaders: Option[];
    roles: Option[];
  };
  advancedOpen: boolean;
  onAdvancedToggle: (open: boolean) => void;
  advancedContent: ReactNode;
};

export function FiltersBar({
  innerRef,
  resultCount,
  isLoading,
  chips,
  limit,
  sort,
  onLimitChange,
  onSortChange,
  onReset,
  values,
  handlers,
  quickRangeHandlers,
  options,
  advancedOpen,
  onAdvancedToggle,
  advancedContent,
}: FiltersBarProps) {
  const generalId = useId();
  const emailId = useId();
  const startFromId = useId();
  const startToId = useId();
  const endFromId = useId();
  const endToId = useId();

  const resultText = useMemo(() => {
    if (isLoading) return "Carregando resultados...";
    const suffix = resultCount === 1 ? "resultado" : "resultados";
    return `${resultCount} ${suffix}`;
  }, [isLoading, resultCount]);

  return (
    <section
      ref={innerRef}
      id="filters"
      className="card space-y-6 px-6 py-5"
    >
      <form
        role="search"
        className="space-y-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className="space-y-4">
          <legend className="sr-only">Filtros principais</legend>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LabeledInput
              id={generalId}
              label="Busca geral"
              placeholder="Busque por departamento, curso, instituição, líder, cargo ..."
              value={values.generalQuery}
              onChange={handlers.onGeneralQueryChange}
            />
            <LabeledInput
              id={emailId}
              label="Buscar por e-mail"
              placeholder="ex: talento@example.com"
              value={values.email}
              onChange={handlers.onEmailChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <LabeledMultiSelect
              id="filter-courses"
              label="Curso(s)"
              selected={values.courses}
              options={options.courses.map((value) => ({ value, label: value }))}
              onChange={handlers.onCoursesChange}
            />
            <LabeledMultiSelect
              id="filter-institutions"
              label="Instituição(ões)"
              selected={values.institutions}
              options={options.institutions.map((value) => ({ value, label: value }))}
              onChange={handlers.onInstitutionsChange}
            />
            <RangeInputs
              label="Ciclo atual (faixa)"
              minLabel="Mínimo"
              maxLabel="Máximo"
              minValue={values.cycleMin}
              maxValue={values.cycleMax}
              onMinChange={handlers.onCycleMinChange}
              onMaxChange={handlers.onCycleMaxChange}
            />
            <LabeledMultiSelect
              id="filter-departments"
              label="Departamentos"
              selected={values.departments}
              options={options.departments}
              onChange={handlers.onDepartmentsChange}
            />
            <LabeledMultiSelect
              id="filter-orchestrator"
              label="Orchestrator"
              selected={values.orchestrators}
              options={options.orchestrators}
              onChange={handlers.onOrchestratorsChange}
              footer={
                <label className="flex items-center gap-2 rounded-md px-1 py-1 text-xs text-[var(--color-subtle)]">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)] bg-[var(--color-soft)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                    checked={values.orchestratorNull}
                    onChange={(event) => handlers.onOrchestratorNullChange(event.target.checked)}
                  />
                  Sem estado
                </label>
              }
            />
            <LabeledMultiSelect
              id="filter-pdi"
              label="PDI pronto?"
              selected={values.pdi ? [values.pdi] : []}
              options={[
                { value: "true", label: "Sim" },
                { value: "false", label: "Não" },
              ]}
              onChange={(next) => handlers.onPdiChange(next[0] ?? "")}
            />
            <LabeledMultiSelect
              id="filter-status"
              label="Status"
              selected={values.statuses}
              options={options.statuses}
              onChange={handlers.onStatusesChange}
            />
            <LabeledMultiSelect
              id="filter-leaders"
              label="Líder"
              selected={values.leaders}
              options={options.leaders}
              onChange={handlers.onLeadersChange}
              footer={
                <label className="flex items-center gap-2 rounded-md px-1 py-1 text-xs text-[var(--color-subtle)]">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)] bg-[var(--color-soft)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                    checked={values.noLeader}
                    onChange={(event) => handlers.onNoLeaderChange(event.target.checked)}
                  />
                  Sem líder
                </label>
              }
            />
            <LabeledMultiSelect
              id="filter-roles"
              label="Cargo alvo"
              selected={values.roles}
              options={options.roles}
              onChange={handlers.onRolesChange}
              footer={
                <label className="flex items-center gap-2 rounded-md px-1 py-1 text-xs text-[var(--color-subtle)]">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)] bg-[var(--color-soft)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                    checked={values.noRole}
                    onChange={(event) => handlers.onNoRoleChange(event.target.checked)}
                  />
                  Sem cargo alvo
                </label>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DateRange
              label="Vigência - início"
              fromId={startFromId}
              toId={startToId}
              fromValue={values.startFrom}
              toValue={values.startTo}
              onFromChange={handlers.onStartFromChange}
              onToChange={handlers.onStartToChange}
            />
            <DateRange
              label="Vigência - fim"
              fromId={endFromId}
              toId={endToId}
              fromValue={values.endFrom}
              toValue={values.endTo}
              onFromChange={handlers.onEndFromChange}
              onToChange={handlers.onEndToChange}
            />
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Atalhos de vigência">
            <button type="button" className="btn-ghost text-xs" onClick={quickRangeHandlers.today}>
              Ativos hoje
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={quickRangeHandlers.incoming30}>
              Entram nos próximos 30 dias
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={quickRangeHandlers.ending30}>
              Terminam nos próximos 30 dias
            </button>
          </div>
        </fieldset>
      </form>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[var(--color-subtle)]" aria-live="polite">
          {resultText}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
              Por página
            </label>
            <select
              id="page-size"
              className="select w-24"
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
              Ordenar
            </label>
            {(() => {
              const sortValue = sort === "date_updated" || sort === "-date_updated" ? sort : "custom";
              return (
                <select
                  id="sort-by"
                  className="select w-48"
                  value={sortValue}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === "custom") return;
                    onSortChange(next);
                  }}
                >
                  <option value="-date_updated">Mais recentes (atualização)</option>
                  <option value="date_updated">Mais antigos (atualização)</option>
                  <option value="custom" disabled>
                    Ordenação personalizada
                  </option>
                </select>
              );
            })()}
          </div>
          <button type="button" className="btn-ghost" onClick={onReset}>
            Limpar filtros
          </button>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {chips.map((chip) => (
            <span key={chip.id} className="chip">
              <span className="truncate max-w-[10rem]" title={`${chip.label}: ${chip.value}`}>
                <strong>{chip.label}:</strong> {chip.value}
              </span>
              <button
                type="button"
                className="text-xs text-[var(--color-subtle)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                onClick={chip.onRemove}
                aria-label={`Remover filtro ${chip.label}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <details
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/40 p-4"
        open={advancedOpen}
        onToggle={(event) => onAdvancedToggle((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[var(--color-text)]">
          Filtros avançados
          <span className="text-xs text-[var(--color-subtle)]">{advancedOpen ? "Ocultar" : "Mostrar"}</span>
        </summary>
        <div className="mt-4 space-y-4 text-sm text-[var(--color-text)]">{advancedContent}</div>
      </details>
    </section>
  );
}

type LabeledInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

function LabeledInput({ id, label, placeholder, value, type = "text", onChange }: LabeledInputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">{label}</span>
      <input
        id={id}
        type={type}
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

type RangeInputsProps = {
  label: string;
  minLabel: string;
  maxLabel: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
};

function RangeInputs({ label, minLabel, maxLabel, minValue, maxValue, onMinChange, onMaxChange }: RangeInputsProps) {
  return (
    <fieldset className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/50 px-3 py-2">
      <legend className="px-1 text-xs uppercase tracking-wide text-[var(--color-subtle)]">{label}</legend>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="input w-24"
          value={minValue}
          onChange={(event) => onMinChange(event.target.value)}
          aria-label={minLabel}
        />
        <span className="text-[var(--color-subtle)]">–</span>
        <input
          type="number"
          className="input w-24"
          value={maxValue}
          onChange={(event) => onMaxChange(event.target.value)}
          aria-label={maxLabel}
        />
      </div>
    </fieldset>
  );
}

type DateRangeProps = {
  label: string;
  fromId: string;
  toId: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

function DateRange({ label, fromId, toId, fromValue, toValue, onFromChange, onToChange }: DateRangeProps) {
  return (
    <fieldset className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-soft)]/50 px-3 py-2">
      <legend className="px-1 text-xs uppercase tracking-wide text-[var(--color-subtle)]">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={fromId} className="text-xs text-[var(--color-subtle)]">
            De
          </label>
          <input
            id={fromId}
            type="date"
            className="input"
            value={fromValue}
            onChange={(event) => onFromChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={toId} className="text-xs text-[var(--color-subtle)]">
            Até
          </label>
          <input
            id={toId}
            type="date"
            className="input"
            value={toValue}
            onChange={(event) => onToChange(event.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}

type MultiSelectProps = {
  id: string;
  label: string;
  selected: string[];
  options: Option[];
  onChange: (values: string[]) => void;
  footer?: ReactNode;
};

function LabeledMultiSelect({ id, label, selected, options, onChange, footer }: MultiSelectProps) {
  const triggerId = useId();
  const labelId = useId();
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span id={labelId} className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
        {label}
      </span>
      <MultiSelectDropdown
        id={id}
        triggerId={triggerId}
        labelId={labelId}
        selected={selected}
        options={options}
        onChange={onChange}
        footer={footer}
      />
    </div>
  );
}

type MultiSelectDropdownProps = {
  id: string;
  triggerId: string;
  labelId: string;
  selected: string[];
  options: Option[];
  onChange: (values: string[]) => void;
  footer?: ReactNode;
};

function MultiSelectDropdown({ id, triggerId, labelId, selected, options, onChange, footer }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickAway(() => setOpen(false), triggerRef, panelRef);
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const placeholder = selected.length
    ? `${selected.length} selecionado${selected.length > 1 ? "s" : ""}`
    : "Selecionar";

  return (
    <div className="relative">
      <button
        id={triggerId}
        type="button"
        ref={triggerRef}
        className="select text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${triggerId}`}
        aria-controls={id}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex items-center justify-between">
          <span className="truncate" title={selected.join(", ") || undefined}>
            {selected.length ? selected.join(", ") : placeholder}
          </span>
          <span className="ml-2 text-[var(--color-subtle)]">▾</span>
        </span>
      </button>
      {open ? (
        <div
          ref={panelRef}
          className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-2 shadow-xl"
          role="listbox"
          aria-multiselectable
          aria-labelledby={labelId}
          id={id}
        >
          <div className="space-y-1">
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-soft)]"
                  role="option"
                  aria-selected={checked}
                >
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)] bg-[var(--color-soft)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                    checked={checked}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? Array.from(new Set([...selected, option.value]))
                        : selected.filter((value) => value !== option.value);
                      onChange(next);
                    }}
                  />
                  <span className="truncate" title={option.label}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
          {footer ? <div className="mt-2 border-t border-[var(--color-border)] pt-2">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

function useClickAway(handler: () => void, ...refs: RefObject<HTMLElement>[]) {
  useEffect(() => {
    const listener = (event: MouseEvent | FocusEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current && ref.current.contains(target))) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("focusin", listener as EventListener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("focusin", listener as EventListener);
    };
  }, [handler, refs]);
}
