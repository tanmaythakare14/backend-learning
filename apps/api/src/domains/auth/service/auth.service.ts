import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../repository/auth.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { SyncProfileDto, UserOutDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
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
