import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception for password hashing errors
 */
export class PasswordHashingException extends HttpException {
  constructor(message: string, status: number = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

/**
 * Exception for errors during the hashing process
 */
export class HashingError extends PasswordHashingException {
  constructor(message: string = 'Error hashing password') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
