export interface IRoleRepository {
  findIdsByNames(names: string[]): Promise<number[]>;
}
