import type { IRoleRepository } from "@application/talent/ports/role-repository.port";
import { parseSmartSearch, type ParsedSearch } from "@shared/ai-search/smart-search.parser";

export type SmartSearchDependencies = {
  roleRepository: IRoleRepository;
};

export type SmartSearchUseCase = {
  execute: (input: string) => Promise<ParsedSearch>;
};

export function createSmartSearchUseCase(
  deps: SmartSearchDependencies
): SmartSearchUseCase {
  return {
    async execute(input: string) {
      return parseSmartSearch(input, {
        resolveTargetRoles: (names) => deps.roleRepository.findIdsByNames(names),
        now: new Date(),
      });
    },
  };
}
