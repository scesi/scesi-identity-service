import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../auth-roles/entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { PasswordHashingService } from '../auth/services/password-hashing.service';
import { RoleService } from '../auth-roles/role.service';
import { ROLES } from '../auth-roles/constants';
import { INSTITUTIONAL_EMAIL_DOMAIN } from './constants';
import { UserStatus } from './value-objects/user-status.value-object';

interface ProvisionUserParams {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  roleName: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private passwordHashingService: PasswordHashingService,
    private roleService: RoleService,
  ) {}

  /**
   * Create a new user (legacy endpoint, kept for backward compatibility).
   * @param createUserDto - User data and password
   * @returns Created user without password hash
   */
  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await this.passwordHashingService.hash(
      createUserDto.password,
    );

    const user = this.usersRepository.create({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.withoutPasswordHash(savedUser);
  }

  /**
   * Public self-service registration (POST /api/v1/auth/register, issue #33).
   * - 409 Conflict when the email already exists
   * - Argon2id password hashing
   * - Default role ROLE_STUDENT (provisioned idempotently)
   * - Status ACTIVO for institutional emails, PENDIENTE otherwise
   */
  async register(
    registerDto: RegisterUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const passwordHash = await this.passwordHashingService.hash(
      registerDto.password,
    );

    return this.provisionUser({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      passwordHash,
      roleName: ROLES.STUDENT,
    });
  }

  /**
   * Admin-created user (POST /api/v1/admin/users, issue #34).
   * Same rules as public registration, with an optional role override
   * (default ROLE_MEMBER).
   */
  async createByAdmin(
    adminDto: AdminCreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const passwordHash = await this.passwordHashingService.hash(
      adminDto.password,
    );

    return this.provisionUser({
      email: adminDto.email,
      firstName: adminDto.firstName,
      lastName: adminDto.lastName,
      passwordHash,
      roleName: adminDto.role ?? ROLES.MEMBER,
    });
  }

  /**
   * Shared provisioning core for public and admin user creation:
   * duplicate check (409), role resolution, institutional-domain status,
   * persistence with the role link.
   */
  private async provisionUser(
    params: ProvisionUserParams,
  ): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: params.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const role = await this.roleService.ensureRole(params.roleName);

    const user = this.usersRepository.create({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      passwordHash: params.passwordHash,
      status: this.resolveStatus(params.email),
    });

    let savedUser: User;
    try {
      savedUser = await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }

    const userRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleId: role.id,
      user: savedUser,
      role,
    });
    await this.userRoleRepository.save(userRole);

    return this.withoutPasswordHash(savedUser);
  }

  /**
   * Institutional emails (@est.umss.edu) are auto-activated; the rest wait
   * for approval.
   */
  private resolveStatus(email: string): UserStatus {
    return email.toLowerCase().endsWith(INSTITUTIONAL_EMAIL_DOMAIN)
      ? UserStatus.ACTIVO
      : UserStatus.PENDIENTE;
  }

  private withoutPasswordHash(user: User): Omit<User, 'passwordHash'> {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;
    return userWithoutPassword;
  }

  /**
   * Find a user by email
   * @param email - User email
   * @returns User or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by ID
   * @param id - User ID
   * @returns User or null
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Find a user with its roles and the associated permissions.
   * @param id - User ID
   * @returns User with the `roles` relation populated or null
   */
  async findByIdWithRoles(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { roles: { role: { permissions: { permission: true } } } },
    });
  }

  /**
   * Verify a password against a stored hash
   * @param password - Plaintext password
   * @param passwordHash - Stored hash
   * @returns true if match, false otherwise
   */
  async verifyPassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await this.passwordHashingService.verify(password, passwordHash);
  }
}
