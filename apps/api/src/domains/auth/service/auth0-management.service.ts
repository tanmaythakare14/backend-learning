import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '../../../common/exceptions';
import { LoggerService } from '../../../common/utils/logger.service';

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

/** Auth0's database connection name. Social logins (google-oauth2|…) have no password here. */
const DATABASE_CONNECTION = 'Username-Password-Authentication';

/** Refresh the management token a minute before Auth0 expires it. */
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

/**
 * Thin wrapper over the two Auth0 endpoints the password change needs.
 *
 * Auth0 owns credentials — this app never stores a password. To change one we
 * verify the old password by trying to exchange it for a token, then ask the
 * Management API to set the new one.
 */
@Injectable()
export class Auth0ManagementService {
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly logger: LoggerService) {}

  private get config(): { domain: string; clientId: string; clientSecret: string } {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Auth0 management credentials are not configured on the server.',
      );
    }
    return { domain, clientId, clientSecret };
  }

  /** True for users who actually have a password with us (not Google, etc.). */
  isDatabaseUser(auth0Sub: string): boolean {
    return auth0Sub.startsWith('auth0|');
  }

  /**
   * Confirms the supplied password is the user's current one, by asking Auth0 to
   * exchange it for a token.
   *
   * Uses password-realm rather than the plain password grant: it names the
   * connection in the request, so it does not depend on the tenant's Default
   * Directory being configured. Both need the Password grant type enabled on
   * the application.
   */
  async verifyCurrentPassword(email: string, password: string): Promise<void> {
    const { domain, clientId, clientSecret } = this.config;

    const res = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: email,
        password,
        client_id: clientId,
        client_secret: clientSecret,
        realm: DATABASE_CONNECTION,
        scope: 'openid',
      }),
    });

    if (res.ok) return;

    const body = (await res.json().catch(() => ({}))) as TokenResponse;

    // Auth0 answers a wrong password with invalid_grant. Anything else is a
    // configuration problem on our side, and shouldn't read as "wrong password".
    if (body.error === 'invalid_grant') {
      throw new UnauthorizedException('Your current password is incorrect.');
    }

    this.logger.error(
      `Auth0 password verification failed: ${body.error ?? res.status} ${body.error_description ?? ''}`,
    );

    if (body.error === 'unauthorized_client' || body.error === 'unsupported_grant_type') {
      throw new InternalServerErrorException(
        'Password verification is not enabled for this application in Auth0.',
      );
    }

    throw new InternalServerErrorException('Could not verify your current password.');
  }

  /** Client-credentials token for the Management API, cached until it nearly expires. */
  private async getManagementToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.value;
    }

    const { domain, clientId, clientSecret } = this.config;

    const res = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as TokenResponse;

    if (!res.ok || !body.access_token) {
      this.logger.error(
        `Auth0 management token request failed: ${body.error ?? res.status} ${body.error_description ?? ''}`,
      );
      throw new InternalServerErrorException('Could not reach the identity provider.');
    }

    this.cachedToken = {
      value: body.access_token,
      expiresAt: Date.now() + (body.expires_in ?? 0) * 1000 - TOKEN_EXPIRY_MARGIN_MS,
    };
    return body.access_token;
  }

  /**
   * Changes the user's email in Auth0 — the identity provider owns it, so this
   * has to succeed before we write the new address to our own table.
   *
   * `verify_email: false` keeps Auth0 from sending its own verification mail;
   * flip it to true once a verification flow is wanted.
   */
  async updateEmail(auth0Sub: string, email: string): Promise<void> {
    const { domain } = this.config;
    const token = await this.getManagementToken();

    const res = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(auth0Sub)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        connection: DATABASE_CONNECTION,
        verify_email: false,
      }),
    });

    if (res.ok) return;

    const body = (await res.json().catch(() => ({}))) as { message?: string };

    if (res.status === 409) {
      throw new ConflictException('That email address is already in use.');
    }
    if (res.status === 400) {
      throw new BadRequestException(body.message ?? 'Auth0 rejected that email address.');
    }

    this.logger.error(`Auth0 email update failed: ${res.status} ${body.message ?? ''}`);
    throw new InternalServerErrorException('Could not update your email address.');
  }

  /** Sets a new password on the Auth0 user identified by the verified `sub` claim. */
  async updatePassword(auth0Sub: string, newPassword: string): Promise<void> {
    const { domain } = this.config;
    const token = await this.getManagementToken();

    const res = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(auth0Sub)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: newPassword, connection: DATABASE_CONNECTION }),
    });

    if (res.ok) return;

    const body = (await res.json().catch(() => ({}))) as { message?: string; statusCode?: number };

    // Auth0 rejects passwords that fail the tenant policy or match a recent one.
    // That message is written for end users, so it is safe to pass through.
    if (res.status === 400) {
      throw new BadRequestException(body.message ?? 'That password was rejected.');
    }

    this.logger.error(`Auth0 password update failed: ${res.status} ${body.message ?? ''}`);
    throw new InternalServerErrorException('Could not update your password.');
  }
}
