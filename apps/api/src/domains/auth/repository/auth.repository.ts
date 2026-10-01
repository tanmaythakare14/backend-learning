import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface UpsertProfileData {
  auth0Sub: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByAuth0Sub(auth0Sub: string): Promise<User | null> {
    return this.repository.findOne({ where: { auth0Sub } });
  }

  /** Just-in-time provisioning: creates the profile row on first sight of a `sub`, refreshes it otherwise. */
  async upsertFromAuth0(data: UpsertProfileData): Promise<User> {
    const existing = await this.findByAuth0Sub(data.auth0Sub);
    if (existing) {
      await this.repository.update(existing.id, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      return { ...existing, ...data };
    }

    const created = this.repository.create({ ...data, isActive: true });
    return this.repository.save(created);
  }
}
