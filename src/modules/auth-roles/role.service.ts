import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { AuthRole } from './entities/auth-role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(AuthRole)
    private readonly roleRepository: Repository<AuthRole>,
  ) {}

  /**
   * Find a role by name or create it. Idempotent: concurrent creations are
   * resolved through the unique `name` column (23505 → re-select).
   */
  async ensureRole(name: string): Promise<AuthRole> {
    const existing = await this.roleRepository.findOne({ where: { name } });
    if (existing) {
      return existing;
    }

    try {
      return await this.roleRepository.save(
        this.roleRepository.create({ name }),
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        const retry = await this.roleRepository.findOne({ where: { name } });
        if (retry) {
          return retry;
        }
      }
      throw error;
    }
  }
}
