import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ICrudBase, PaginationParams, PaginatedResult } from '../interfaces';

export abstract class BaseService<
  T extends { id: string | number },
  CreateDTO,
  UpdateDTO,
> implements ICrudBase<T, CreateDTO, UpdateDTO> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(dto: CreateDTO): Promise<T> {
    const entity = this.repository.create(dto as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async findAll(query?: PaginationParams): Promise<PaginatedResult<T>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;

    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: query?.sortBy
        ? ({ [query.sortBy]: query.order ?? 'ASC' } as Record<string, string>)
        : undefined,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string | number): Promise<T> {
    const entity = await this.repository.findOneBy({
      id,
    } as unknown as FindOptionsWhere<T>);
    if (!entity) {
      throw new NotFoundException(`Entidad con id ${id} no encontrada`);
    }
    return entity;
  }

  async update(id: string | number, dto: UpdateDTO): Promise<T> {
    await this.findOne(id); // valida que exista, lanza 404 si no
    await this.repository.update(id, dto as DeepPartial<T>);
    return this.findOne(id);
  }

  async remove(id: string | number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }
}
