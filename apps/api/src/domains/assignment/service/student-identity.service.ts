import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { LoggerService } from '../../../common/utils/logger.service';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '../../../common/exceptions';
import { Student } from '../../student/entities/student.entity';
import { AssignmentRepository } from '../repository/assignment.repository';

interface VerifiedProfile {
  email: string;
  emailVerified: boolean;
  expiresAt: number;
}

const PROFILE_CACHE_TTL_MS = 10 * 60 * 1000;
const PROFILE_CACHE_MAX_ENTRIES = 1000;
const USERINFO_TIMEOUT_MS = 5000;

/**
 * Works out which `student` row the caller is.
 *
 * Every Auth0 login is staff today; a student is whoever's *verified* email equals
 * an active student's email. The email is deliberately NOT read from our `users`
 * table: that column is written from the body of POST /auth/sync, which the client
 * controls, so anyone signed in could claim a student's address. Instead it comes
 * from Auth0's /userinfo endpoint, called with the caller's own access token.
 */
@Injectable()
export class StudentIdentityService {
  private readonly cache = new Map<string, VerifiedProfile>();

  constructor(
    private readonly repository: AssignmentRepository,
    private readonly logger: LoggerService,
  ) {}

  async resolve(req: Request): Promise<Student> {
    const sub = req.user?.sub;
    const token = this.bearerToken(req);
    if (!sub || !token) {
      throw new UnauthorizedException('Sign in to view your assignments.');
    }

    const profile = await this.verifiedProfile(sub, token);

    if (this.requireVerifiedEmail() && !profile.emailVerified) {
      throw new ForbiddenException('Verify your email address to view your assignments.');
    }

    const student = await this.repository.findActiveStudentByEmail(profile.email);
    if (!student) {
      throw new ForbiddenException('Assignments are available to enrolled students.');
    }
    return student;
  }

  /** On unless explicitly set to "false" — relaxing it is a dev-tenant convenience only. */
  private requireVerifiedEmail(): boolean {
    return process.env.AUTH0_REQUIRE_VERIFIED_EMAIL !== 'false';
  }

  private bearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return header.slice('Bearer '.length).trim() || null;
  }

  private async verifiedProfile(sub: string, token: string): Promise<VerifiedProfile> {
    const cached = this.cache.get(sub);
    if (cached && cached.expiresAt > Date.now()) return cached;

    const domain = process.env.AUTH0_DOMAIN;
    let response: Response;
    try {
      response = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(USERINFO_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error('Auth0 /userinfo request failed', error);
      throw new InternalServerErrorException(
        'Could not verify your identity right now. Please try again.',
      );
    }

    if (!response.ok) {
      this.logger.warn('Auth0 /userinfo rejected the token', { status: response.status });
      throw new ForbiddenException('Could not verify your email address.');
    }

    const body = (await response.json()) as { email?: unknown; email_verified?: unknown };
    if (typeof body.email !== 'string' || body.email.length === 0) {
      throw new ForbiddenException('Your account has no email address to match to a student.');
    }

    const profile: VerifiedProfile = {
      email: body.email,
      emailVerified: body.email_verified === true,
      expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
    };

    if (this.cache.size >= PROFILE_CACHE_MAX_ENTRIES) this.cache.clear();
    this.cache.set(sub, profile);
    return profile;
  }
}
