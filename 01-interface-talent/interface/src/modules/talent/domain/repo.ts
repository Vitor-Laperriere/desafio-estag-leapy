import type { Talent } from "./entities";
import type { ListTalentsFilter } from "./filters";

export interface ITalentRepository {
  listTalents(
    filter: ListTalentsFilter
  ): Promise<{ data: Talent[]; total: number }>;
}