import * as argon2 from 'argon2';
import { HashingError } from '../exceptions/password-hashing.exceptions';

/**
 * Password hashing service using Argon2id
 */
export class PasswordHashingService {
  /**
   * Hash a password with Argon2id
   * @param password - The plaintext password
   * @returns The hashed password
   */
  async hash(password: string): Promise<string> {
    try {
      const memoryCost = parseInt(process.env.ARGON2_MEMORY_COST || '65536');
      const timeCost = parseInt(process.env.ARGON2_TIME_COST || '3');
      const parallelism = parseInt(process.env.ARGON2_PARALLELISM || '2');

      return await argon2.hash(password, {
        memoryCost,
        timeCost,
        parallelism,
        type: 2,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HashingError(`Error hashing password: ${errorMessage}`);
    }
  }

  /**
   * Verify if a password matches a stored hash
   * @param password - The plaintext password
   * @param hash - The stored hash
   * @returns true if they match, false otherwise
   */
  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
