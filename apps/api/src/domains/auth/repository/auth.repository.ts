import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

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

  /** Used to reject an email already taken by a different profile. */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /** Overwrites the editable profile fields and stamps updated_at. */
  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    await this.repository.update(id, { ...data, updatedAt: new Date() });
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) throw new Error(`Profile ${id} vanished during update`);
    return updated;
  }

  /** Just-in-time provisioning: creates the profile row on first sight of a `sub`, refreshes it otherwise. */
  async upsertFromAuth0(data: UpsertProfileData): Promise<User> {
    const existing = await this.findByAuth0Sub(data.auth0Sub);
    if (existing) {
      // Only the email tracks Auth0. Names and phone are ours: the token carries
      // the email as a display name for database users, so re-syncing them on
      // every login would wipe whatever the user saved in Settings.
      await this.repository.update(existing.id, { email: data.email });
      return { ...existing, email: data.email };
    }

    const created = this.repository.create({ ...data, isActive: true });
    return this.repository.save(created);
  }
}
