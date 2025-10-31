import { z } from "zod";
export const ListTalentsFilter = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
  sort: z.string().default("-date_updated"),
  email: z.string().trim().optional(),
  q: z.string().trim().optional(),
  department: z.string().trim().optional(),
  orchestrator_state: z.string().trim().optional(),
  pdi_plan_ready: z.enum(["true","false"]).optional(),
  start_date_from: z.string().trim().optional(),
  end_date_to: z.string().trim().optional(),
  leader_id: z.string().trim().optional(),
  target_role_id: z.string().trim().optional(),
});
export type ListTalentsFilter = z.infer<typeof ListTalentsFilter>;