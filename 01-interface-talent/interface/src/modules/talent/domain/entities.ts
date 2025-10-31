export type Talent = {
    id: string;
    userEmail?: string | null;
    department?: string | null;
    currentStatus?: string | null;
    orchestratorState?: string | null;
    pdiPlanReady?: boolean | null;
    startDate?: string | null;
    endDate?: string | null;
    leader?: { id: number; position?: string | null; department?: string | null } | null;
    targetRole?: { id: number; name: string; description?: string | null } | null;
  };