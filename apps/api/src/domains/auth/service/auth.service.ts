import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repository/auth.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { MailService } from '../../../common/utils/mail.service';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '../../../common/exceptions';
import { AuthErrorMessages } from '../../../common/constants/auth-error-messages.constants';
import {
  RegisterDto,
  LoginDto,
  LoginOutDto,
  UserOutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';
import { User } from '../entities/user.entity';

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
    private readonly mail: MailService,
  ) {}

  async register(data: RegisterDto): Promise<UserOutDto> {
    const email = data.email.trim().toLowerCase();
    this.audit.log('AuthService', 'Registration started', { email });

    const existing = await this.repository.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(data.password);
    const created = await this.repository.create({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      passwordHash,
    });

    this.logger.info('New account registered');
    this.audit.log('AuthService', 'Registration succeeded', { userId: created.id }, 'info');
    return this.toOutDto(created);
  }

  async login(data: LoginDto): Promise<LoginOutDto> {
    const email = data.email.trim().toLowerCase();
    this.audit.log('AuthService', 'Login attempt', { email });

    const user = await this.repository.findByEmail(email);
    if (!user || !user.isActive) {
      this.audit.log('AuthService', 'Login failed — unknown or inactive email', { email }, 'warn');
      throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    const passwordMatches = await argon2.verify(user.passwordHash, data.password);
    if (!passwordMatches) {
      this.audit.log('AuthService', 'Login failed — wrong password', { userId: user.id }, 'warn');
      throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');

    const token = jwt.sign({ userId: user.id, email: user.email, roles: [] as string[] }, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'],
    });

    this.logger.info('User logged in');
    this.audit.log('AuthService', 'Login succeeded', { userId: user.id }, 'info');
    return { token, user: this.toOutDto(user) };
  }

  /**
   * Always resolves the same way regardless of whether the email is
   * registered — responding differently for known vs. unknown emails would
   * let an attacker enumerate which addresses have accounts.
   */
  async requestPasswordReset(data: ForgotPasswordDto): Promise<void> {
    const email = data.email.trim().toLowerCase();
    this.audit.log('AuthService', 'Password reset requested', { email });

    const user = await this.repository.findByEmail(email);
    if (!user || !user.isActive) {
      this.audit.log(
        'AuthService',
        'Password reset requested for unknown or inactive email',
        { email },
        'warn',
      );
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
    await this.repository.setPasswordResetToken(user.id, tokenHash, expiresAt);

    const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3000';
    const resetUrl = `${webAppUrl}/reset-password?token=${rawToken}`;
    await this.mail.sendPasswordResetEmail(user.email, resetUrl);

    this.logger.info('Password reset email dispatched');
    this.audit.log('AuthService', 'Password reset email dispatched', { userId: user.id }, 'info');
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const tokenHash = createHash('sha256').update(data.token).digest('hex');
    const user = await this.repository.findByValidResetToken(tokenHash);
    if (!user) {
      throw new BadRequestException('This reset link is invalid or has expired');
    }

    const passwordHash = await argon2.hash(data.password);
    await this.repository.resetPassword(user.id, passwordHash);

    this.logger.info('Password reset completed');
    this.audit.log('AuthService', 'Password reset completed', { userId: user.id }, 'info');
  }

  private toOutDto(user: User): UserOutDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
