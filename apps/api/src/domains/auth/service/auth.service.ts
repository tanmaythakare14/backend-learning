import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { ChangePasswordDto, SyncProfileDto, UpdateProfileDto, UserOutDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { Auth0ManagementService } from './auth0-management.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../../../common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
    private readonly auth0: Auth0ManagementService,
  ) {}

  /**
   * Just-in-time provisioning: Auth0 owns identity/credentials entirely — this
   * just keeps a local profile row in sync, keyed by the token's verified
   * `sub` claim. Called by the frontend once right after login.
   */
  async syncProfile(auth0Sub: string, data: SyncProfileDto): Promise<UserOutDto> {
    this.audit.log('AuthService', 'Profile sync', { auth0Sub });

    const user = await this.repository.upsertFromAuth0({
      auth0Sub,
      email: data.email.trim().toLowerCase(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    });

    this.logger.info('Profile synced from Auth0');
    this.audit.log('AuthService', 'Profile sync succeeded', { userId: user.id }, 'info');
    return this.toOutDto(user);
  }

  /**
   * Changes the user's Auth0 password. We never see or store it — the current
   * one is verified by exchanging it with Auth0, then the Management API sets
   * the new one. Identity comes from the verified token, never the request body.
   */
  async changePassword(auth0Sub: string, data: ChangePasswordDto): Promise<void> {
    this.audit.log('AuthService', 'Password change requested', { auth0Sub });

    if (!this.auth0.isDatabaseUser(auth0Sub)) {
      throw new BadRequestException(
        'Your account signs in through a social provider, so there is no Cognify password to change.',
      );
    }

    const user = await this.repository.findByAuth0Sub(auth0Sub);
    if (!user) {
      throw new NotFoundException('Profile not found. Sign out and back in, then try again.');
    }

    await this.auth0.verifyCurrentPassword(user.email, data.currentPassword);
    await this.auth0.updatePassword(auth0Sub, data.newPassword);

    this.logger.info('Password changed via Auth0');
    this.audit.log('AuthService', 'Password change succeeded', { userId: user.id }, 'info');
  }
  /** Current profile for the signed-in user. */
  async getProfile(auth0Sub: string): Promise<UserOutDto> {
    const user = await this.repository.findByAuth0Sub(auth0Sub);
    if (!user) {
      throw new NotFoundException('Profile not found. Sign out and back in, then try again.');
    }
    return this.toOutDto(user);
  }

  /**
   * Updates the profile. Names and phone are ours alone; email belongs to Auth0,
   * so a change there has to land in both places.
   *
   * Order is deliberate: check our own uniqueness constraint first (cheap, and
   * avoids touching Auth0 for a request we'd reject anyway), then Auth0, then
   * our row. Auth0 is the system of record for identity — if the local write
   * failed after Auth0 succeeded, the next /auth/sync on login re-syncs the
   * email from the token, so the divergence is self-healing.
   */
  async updateProfile(auth0Sub: string, data: UpdateProfileDto): Promise<UserOutDto> {
    this.audit.log('AuthService', 'Profile update requested', { auth0Sub });

    const user = await this.repository.findByAuth0Sub(auth0Sub);
    if (!user) {
      throw new NotFoundException('Profile not found. Sign out and back in, then try again.');
    }

    const email = data.email.trim().toLowerCase();
    const emailChanged = email !== user.email;

    if (emailChanged) {
      const taken = await this.repository.findByEmail(email);
      if (taken && taken.id !== user.id) {
        throw new ConflictException('That email address is already in use.');
      }

      if (!this.auth0.isDatabaseUser(auth0Sub)) {
        throw new BadRequestException(
          'Your email is managed by your social sign-in provider and cannot be changed here.',
        );
      }

      await this.auth0.updateEmail(auth0Sub, email);
    }

    const updated = await this.repository.updateProfile(user.id, {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone.trim(),
    });

    this.logger.info('Profile updated');
    this.audit.log(
      'AuthService',
      'Profile update succeeded',
      { userId: user.id, emailChanged },
      'info',
    );
    return this.toOutDto(updated);
  }

  /**
   * First login provisions the row from Auth0's display name, which for database
   * users is the email — so an "@" in the first name means the user never
   * entered a real one.
   */
  private isProfileComplete(user: User): boolean {
    const firstName = user.firstName?.trim() ?? '';
    return (
      firstName.length > 0 &&
      !firstName.includes('@') &&
      (user.lastName?.trim().length ?? 0) > 0 &&
      (user.phone?.trim().length ?? 0) > 0
    );
  }

  private toOutDto(user: User): UserOutDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileComplete: this.isProfileComplete(user),
      createdAt: user.createdAt,
    };
  }
}
