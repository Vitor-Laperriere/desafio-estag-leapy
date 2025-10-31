import type { ITalentRepository } from "../../domain/repo";
import { ListTalentsFilter } from "../../domain/filters";

export function makeListTalents(repo: ITalentRepository) {
  return async (raw: unknown) => {
    const params = ListTalentsFilter.parse(raw);
    return repo.listTalents(params);
  };
}