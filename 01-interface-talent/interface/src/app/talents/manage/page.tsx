'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import type { Talent } from "@presentation/talent/hooks/use-talents";

type PdiPlanReadyValue = "true" | "false" | "null";

type TalentFormState = {
  id: string;
  userId: string;
  phoneNumber: string;
  verifiedPhoneNumber: string;
  graduationCourse: string;
  graduationInstitution: string;
  currentSkills: string;
  targetRoleId: string;
  leaderId: string;
  resetCount: string;
  currentCycleId: string;
  currentCycle: string;
  department: string;
  currentStatus: string;
  orchestratorState: string;
  pdiPlanReady: PdiPlanReadyValue;
  startDate: string;
  endDate: string;
  dateDeleted: string;
  lastStatusChangeAt: string;
  lastResetAt: string;
};

const emptyForm: TalentFormState = {
  id: "",
  userId: "",
  phoneNumber: "",
  verifiedPhoneNumber: "",
  graduationCourse: "",
  graduationInstitution: "",
  currentSkills: "",
  targetRoleId: "",
  leaderId: "",
  resetCount: "",
  currentCycleId: "",
  currentCycle: "",
  department: "",
  currentStatus: "",
  orchestratorState: "",
  pdiPlanReady: "null",
  startDate: "",
  endDate: "",
  dateDeleted: "",
  lastStatusChangeAt: "",
  lastResetAt: "",
};

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function mapTalentToForm(talent: Talent): TalentFormState {
  return {
    id: talent.id ?? "",
    userId: talent.userId ?? "",
    phoneNumber: talent.phoneNumber ?? "",
    verifiedPhoneNumber: talent.verifiedPhoneNumber ?? "",
    graduationCourse: talent.graduationCourse ?? "",
    graduationInstitution: talent.graduationInstitution ?? "",
    currentSkills: stringifyValue(talent.currentSkills),
    targetRoleId:
      talent.targetRoleId !== null && talent.targetRoleId !== undefined
        ? String(talent.targetRoleId)
        : "",
    leaderId:
      talent.leaderId !== null && talent.leaderId !== undefined
        ? String(talent.leaderId)
        : "",
    resetCount:
      talent.resetCount !== null && talent.resetCount !== undefined
        ? String(talent.resetCount)
        : "",
    currentCycleId: talent.currentCycleId ?? "",
    currentCycle:
      talent.currentCycle !== null && talent.currentCycle !== undefined
        ? String(talent.currentCycle)
        : "",
    department: talent.department ?? "",
    currentStatus: talent.currentStatus ?? "",
    orchestratorState: talent.orchestratorState ?? "",
    pdiPlanReady:
      talent.pdiPlanReady === null || talent.pdiPlanReady === undefined
        ? "null"
        : talent.pdiPlanReady
          ? "true"
          : "false",
    startDate: talent.startDate ?? "",
    endDate: talent.endDate ?? "",
    dateDeleted: talent.dateDeleted ?? "",
    lastStatusChangeAt: talent.lastStatusChangeAt ?? "",
    lastResetAt: talent.lastResetAt ?? "",
  };
}

function ensurePresent(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} é obrigatório.`);
  }
  return trimmed;
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function toOptionalNumber(
  value: string,
  label: string,
  options: { allowNull?: boolean; integer?: boolean } = {}
) {
  const { allowNull = true, integer = false } = options;
  const trimmed = value.trim();
  if (!trimmed) return allowNull ? null : undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || (integer && !Number.isInteger(parsed))) {
    throw new Error(
      `O campo ${label} deve ser ${
        integer ? "um número inteiro válido" : "numérico"
      }.`
    );
  }
  return parsed;
}

function toOptionalJson(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function buildPayload(form: TalentFormState, mode: "create" | "update") {
  const payload: Record<string, unknown> = {
    userId: ensurePresent(form.userId, "User ID"),
    phoneNumber: ensurePresent(form.phoneNumber, "Telefone"),
    verifiedPhoneNumber: toOptionalString(form.verifiedPhoneNumber),
    graduationCourse: toOptionalString(form.graduationCourse),
    graduationInstitution: toOptionalString(form.graduationInstitution),
    currentSkills: toOptionalJson(form.currentSkills),
    targetRoleId: toOptionalNumber(form.targetRoleId, "Cargo alvo (ID)", {
      integer: true,
    }),
    leaderId: toOptionalNumber(form.leaderId, "Líder (ID)", {
      integer: true,
    }),
    resetCount: toOptionalNumber(form.resetCount, "Reset count", {
      allowNull: false,
      integer: true,
    }),
    currentCycleId: toOptionalString(form.currentCycleId),
    currentCycle: toOptionalNumber(form.currentCycle, "Ciclo atual", {
      allowNull: false,
      integer: true,
    }),
    department: toOptionalString(form.department),
    currentStatus: toOptionalString(form.currentStatus),
    orchestratorState: toOptionalString(form.orchestratorState),
    pdiPlanReady:
      form.pdiPlanReady === "null"
        ? null
        : form.pdiPlanReady === "true"
          ? true
          : false,
    startDate: toOptionalString(form.startDate),
    endDate: toOptionalString(form.endDate),
    dateDeleted: toOptionalString(form.dateDeleted),
    lastStatusChangeAt: toOptionalString(form.lastStatusChangeAt),
    lastResetAt: toOptionalString(form.lastResetAt),
  };

  if (mode === "create") {
    const id = form.id.trim();
    if (id.length) {
      payload.id = id;
    }
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
}

function extractErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  return typeof err === "string" ? err : "Ocorreu um erro inesperado.";
}

type FieldConfig = {
  name: keyof TalentFormState;
  label: string;
  type?: "text" | "number";
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
};

function FormField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: "text" | "number";
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-text)]">
      <span className="font-medium">{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-text)]">
      <span className="font-medium">{label}</span>
      <textarea
        className="input min-h-[120px]"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function PdiSelect({
  value,
  onChange,
  disabled,
}: {
  value: PdiPlanReadyValue;
  onChange: (next: PdiPlanReadyValue) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[var(--color-text)]">
      <span className="font-medium">Plano de PDI pronto?</span>
      <select
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value as PdiPlanReadyValue)}
        disabled={disabled}
      >
        <option value="null">Não definido</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
    </label>
  );
}

function TalentInfo({ talent }: { talent: Talent }) {
  const name = useMemo(() => {
    const first = talent.userFirstName ?? "";
    const last = talent.userLastName ?? "";
    const composed = `${first} ${last}`.trim();
    return composed.length ? composed : null;
  }, [talent.userFirstName, talent.userLastName]);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-soft)]/60 px-4 py-3 text-sm text-[var(--color-subtle)]">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <span>
          <span className="font-medium text-[var(--color-text)]">Usuário: </span>
          {name ?? "—"}
        </span>
        <span>
          <span className="font-medium text-[var(--color-text)]">Email: </span>
          {talent.userEmail ?? "—"}
        </span>
        <span>
          <span className="font-medium text-[var(--color-text)]">Departamento: </span>
          {talent.department ?? "—"}
        </span>
        <span>
          <span className="font-medium text-[var(--color-text)]">Status atual: </span>
          {talent.currentStatus ?? "—"}
        </span>
      </div>
    </div>
  );
}

export default function ManageTalentsPage() {
  const [lookupId, setLookupId] = useState("");
  const [existingForm, setExistingForm] = useState<TalentFormState>(() => ({
    ...emptyForm,
  }));
  const [loadedTalent, setLoadedTalent] = useState<Talent | null>(null);
  const [existingError, setExistingError] = useState<string | null>(null);
  const [existingSuccess, setExistingSuccess] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [savingExisting, setSavingExisting] = useState(false);
  const [removingExisting, setRemovingExisting] = useState(false);

  const [createForm, setCreateForm] = useState<TalentFormState>(() => ({
    ...emptyForm,
  }));
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [creatingTalent, setCreatingTalent] = useState(false);

  const searchParams = useSearchParams();
  const prefilledId = searchParams?.get("id") ?? "";
  const lastPrefilledId = useRef<string | null>(null);

  const loadTalent = useCallback(
    async (rawId: string, options: { silent?: boolean } = {}) => {
      const { silent = false } = options;
      const id = rawId.trim();
      if (!id) {
        if (!silent) {
          setExistingError("Informe o ID do talento que deseja carregar.");
          setExistingSuccess(null);
        }
        return;
      }

      if (!silent) {
        setExistingError(null);
        setExistingSuccess(null);
      }

      setLoadingExisting(true);
      try {
        const response = await fetch(`/api/talents/${id}`);
        if (response.status === 404) {
          if (!silent) setExistingError("Talento não encontrado.");
          setLoadedTalent(null);
          setExistingForm(() => ({ ...emptyForm }));
          return;
        }

        const json =
          (await response.json().catch(() => ({}))) as {
            data?: Talent;
            detail?: string;
            error?: string;
          };

        if (!response.ok || !json?.data) {
          throw new Error(
            json.detail ?? json.error ?? "Falha ao carregar talento."
          );
        }

        setLoadedTalent(json.data);
        setExistingForm(mapTalentToForm(json.data));
        if (!silent) {
          setExistingSuccess("Talento carregado com sucesso.");
        }
      } catch (error: unknown) {
        if (!silent) {
          setExistingError(extractErrorMessage(error));
        }
        setLoadedTalent(null);
        setExistingForm(() => ({ ...emptyForm }));
      } finally {
        setLoadingExisting(false);
      }
    },
    [
      setExistingError,
      setExistingSuccess,
      setExistingForm,
      setLoadedTalent,
      setLoadingExisting,
    ]
  );

  useEffect(() => {
    const normalized = prefilledId.trim();
    if (!normalized) return;
    if (normalized === lastPrefilledId.current) return;
    lastPrefilledId.current = normalized;
    setLookupId(normalized);
    void loadTalent(normalized);
  }, [prefilledId, loadTalent]);

  const handleLookupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = lookupId.trim();
    setLookupId(trimmed);
    await loadTalent(trimmed);
  };

  const handleExistingChange =
    (field: keyof TalentFormState) => (value: string) => {
      setExistingForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleCreateChange =
    (field: keyof TalentFormState) => (value: string) => {
      setCreateForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!existingForm.id) {
      setExistingError("Carregue um talento antes de salvar as alterações.");
      setExistingSuccess(null);
      return;
    }

    setSavingExisting(true);
    setExistingError(null);
    setExistingSuccess(null);
    try {
      const payload = buildPayload(existingForm, "update");
      const response = await fetch(`/api/talents/${existingForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json =
        (await response.json().catch(() => ({}))) as {
          data?: Talent;
          detail?: string;
          error?: string;
        };

      if (!response.ok || !json?.data) {
        throw new Error(json.detail ?? json.error ?? "Falha ao atualizar talento.");
      }

      setLoadedTalent(json.data);
      setExistingForm(mapTalentToForm(json.data));
      setExistingSuccess("Talento atualizado com sucesso.");
    } catch (error: unknown) {
      setExistingError(extractErrorMessage(error));
    } finally {
      setSavingExisting(false);
    }
  };

  const handleDeleteTalent = async () => {
    if (!existingForm.id) {
      setExistingError("Carregue um talento antes de removê-lo.");
      setExistingSuccess(null);
      return;
    }

    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Tem certeza que deseja remover este talento?")
        : true;
    if (!confirmed) return;

    setRemovingExisting(true);
    setExistingError(null);
    setExistingSuccess(null);
    try {
      const response = await fetch(`/api/talents/${existingForm.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const json = await response.json().catch(() => ({}));
        throw new Error(
          json.detail ?? json.error ?? "Falha ao remover talento."
        );
      }

      setExistingSuccess("Talento removido com sucesso.");
      setExistingForm(() => ({ ...emptyForm }));
      setLoadedTalent(null);
      setLookupId("");
    } catch (error: unknown) {
      setExistingError(extractErrorMessage(error));
    } finally {
      setRemovingExisting(false);
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingTalent(true);
    setCreateError(null);
    setCreateSuccess(null);
    setExistingSuccess(null);

    try {
      const payload = buildPayload(createForm, "create");
      const response = await fetch("/api/talents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json =
        (await response.json().catch(() => ({}))) as {
          data?: Talent;
          detail?: string;
          error?: string;
        };

      if (!response.ok || !json?.data) {
        throw new Error(json.detail ?? json.error ?? "Falha ao criar talento.");
      }

      const created = json.data;
      setCreateSuccess(`Talento ${created.id} criado com sucesso.`);
      setCreateForm(() => ({ ...emptyForm }));
      setLoadedTalent(created);
      setExistingForm(mapTalentToForm(created));
      setLookupId(created.id ?? "");
      setExistingSuccess("Talento criado e pronto para edição.");
    } catch (error: unknown) {
      setCreateError(extractErrorMessage(error));
    } finally {
      setCreatingTalent(false);
    }
  };

  const sharedFields: FieldConfig[] = [
    { name: "userId", label: "User ID", required: true },
    { name: "phoneNumber", label: "Telefone", required: true },
    { name: "verifiedPhoneNumber", label: "Telefone verificado" },
    { name: "graduationCourse", label: "Curso / Escolaridade" },
    { name: "graduationInstitution", label: "Instituição" },
    { name: "department", label: "Departamento" },
    { name: "currentStatus", label: "Status atual" },
    { name: "orchestratorState", label: "Estado do orquestrador" },
    { name: "startDate", label: "Início (ISO)" },
    { name: "endDate", label: "Fim (ISO)" },
    { name: "dateDeleted", label: "Data de exclusão (ISO)" },
    { name: "lastStatusChangeAt", label: "Última mudança de status (ISO)" },
    { name: "lastResetAt", label: "Último reset (ISO)" },
    { name: "currentCycleId", label: "Ciclo atual (ID)" },
  ];

  const numericFields: FieldConfig[] = [
    { name: "targetRoleId", label: "Cargo alvo (ID)", type: "number" },
    { name: "leaderId", label: "Líder (ID)", type: "number" },
    { name: "resetCount", label: "Reset count", type: "number" },
    { name: "currentCycle", label: "Ciclo atual", type: "number" },
  ];

  return (
    <div className="space-y-8">
      <section className="card flex flex-col gap-6 px-6 py-8">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Gerenciar talento existente
          </h2>
          <p className="text-sm text-[var(--color-subtle)]">
            Informe um ID para carregar os dados do talento, atualizar campos ou remover o registro.
          </p>
        </header>

        <form
          onSubmit={handleLookupSubmit}
          className="flex flex-col gap-3 md:flex-row"
        >
          <input
            className="input md:max-w-sm"
            placeholder="Ex: 9d8a5f1f-..."
            value={lookupId}
            onChange={(event) => setLookupId(event.target.value)}
          />
          <button
            type="submit"
            className="btn-primary md:w-auto"
            disabled={loadingExisting}
          >
            {loadingExisting ? "Carregando..." : "Carregar talento"}
          </button>
        </form>

        {existingError ? (
          <p className="text-sm text-[var(--color-secondary)]">{existingError}</p>
        ) : null}
        {existingSuccess ? (
          <p className="text-sm text-[var(--color-primary)]">{existingSuccess}</p>
        ) : null}

        {loadedTalent ? <TalentInfo talent={loadedTalent} /> : null}

        {loadedTalent ? (
          <form
            onSubmit={handleUpdateSubmit}
            className="space-y-6"
            aria-label="Formulário de edição de talento"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField
                label="ID"
                value={existingForm.id}
                onChange={handleExistingChange("id")}
                disabled
              />
              {sharedFields.map((field) => (
                <FormField
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  value={existingForm[field.name]}
                  onChange={handleExistingChange(field.name)}
                  required={field.required}
                />
              ))}
              {numericFields.map((field) => (
                <FormField
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  value={existingForm[field.name]}
                  onChange={handleExistingChange(field.name)}
                />
              ))}
              <PdiSelect
                value={existingForm.pdiPlanReady}
                onChange={(value) => handleExistingChange("pdiPlanReady")(value)}
              />
            </div>
            <TextAreaField
              label="Skills atuais (JSON ou texto)"
              value={existingForm.currentSkills}
              onChange={handleExistingChange("currentSkills")}
              placeholder='Ex: ["comunicação","organização"]'
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={savingExisting}
              >
                {savingExisting ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                type="button"
                className="btn-ghost text-[var(--color-secondary)]"
                onClick={handleDeleteTalent}
                disabled={removingExisting}
              >
                {removingExisting ? "Removendo..." : "Remover talento"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-[var(--color-subtle)]">
            Carregue um talento para habilitar o formulário de edição.
          </p>
        )}
      </section>

      <section className="card flex flex-col gap-6 px-6 py-8">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Criar novo talento
          </h2>
          <p className="text-sm text-[var(--color-subtle)]">
            Preencha os campos necessários e envie para adicionar um novo talento ao banco de dados.
          </p>
        </header>

        {createError ? (
          <p className="text-sm text-[var(--color-secondary)]">{createError}</p>
        ) : null}
        {createSuccess ? (
          <p className="text-sm text-[var(--color-primary)]">{createSuccess}</p>
        ) : null}

        <form
          onSubmit={handleCreateSubmit}
          className="space-y-6"
          aria-label="Formulário de criação de talento"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormField
              label="ID (opcional)"
              value={createForm.id}
              onChange={handleCreateChange("id")}
              placeholder="Deixe vazio para gerar automaticamente"
            />
            {sharedFields.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                type={field.type}
                value={createForm[field.name]}
                onChange={handleCreateChange(field.name)}
                required={field.required}
              />
            ))}
            {numericFields.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                type={field.type}
                value={createForm[field.name]}
                onChange={handleCreateChange(field.name)}
              />
            ))}
            <PdiSelect
              value={createForm.pdiPlanReady}
              onChange={(value) => handleCreateChange("pdiPlanReady")(value)}
            />
          </div>
          <TextAreaField
            label="Skills atuais (JSON ou texto)"
            value={createForm.currentSkills}
            onChange={handleCreateChange("currentSkills")}
            placeholder='Ex: ["comunicação","organização"]'
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={creatingTalent}
          >
            {creatingTalent ? "Criando..." : "Criar talento"}
          </button>
        </form>
      </section>
    </div>
  );
}
