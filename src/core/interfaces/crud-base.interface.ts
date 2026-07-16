import { PaginationParams, PaginatedResult } from './pagination.interface';

export interface ICrudBase<T, CreateDTO, UpdateDTO> {
  create(dto: CreateDTO): Promise<T>;
  findAll(query?: PaginationParams): Promise<PaginatedResult<T>>;
  findOne(id: string | number): Promise<T>;
  update(id: string | number, dto: UpdateDTO): Promise<T>;
  remove(id: string | number): Promise<void>;
}
