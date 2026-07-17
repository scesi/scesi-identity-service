export interface IReadOnlyBase<T> {
  findAll(query?: any): Promise<T[]>;
  findOne(id: string | number): Promise<T>;
}
