import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordHashingService } from '../auth/services/password-hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private passwordHashingService: PasswordHashingService,
  ) {}

  /**
   * Create a new user
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
    const userWithoutPassword = { ...savedUser };
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
