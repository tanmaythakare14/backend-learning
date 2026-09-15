import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create({ ...data, isActive: true });
    return this.repository.save(user);
  }

  async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.repository.update(userId, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });
  }

  /** Only matches a token that hasn't expired — an expired or unknown hash returns null. */
  async findByValidResetToken(tokenHash: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.password_reset_token_hash = :tokenHash', { tokenHash })
      .andWhere('user.password_reset_expires_at > :now', { now: new Date() })
      .getOne();
  }

  async resetPassword(userId: string, passwordHash: string): Promise<void> {
    await this.repository.update(userId, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });
  }
}
