export interface ISoftDeleteBase<T> {
  softRemove(id: string | number): Promise<void>;
  restore(id: string | number): Promise<T>;
}
