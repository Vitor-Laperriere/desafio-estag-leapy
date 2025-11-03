import type { ITalentRepository } from "@application/talent/ports/talent-repository.port";
import { ListTalentsFilter } from "@application/talent/dto/list-talents-filter.dto";

export function makeListTalents(repo: ITalentRepository) {
  return async (raw: unknown) => {
    const params = ListTalentsFilter.parse(raw);
    return repo.listTalents(params);
  };
}
