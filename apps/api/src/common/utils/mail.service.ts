import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { LoggerService } from './logger.service';

/**
 * Thin wrapper around nodemailer. If SMTP_HOST isn't set (the default for
 * local dev — nothing in this repo ships real SMTP credentials), falls back
 * to logging the email's content instead of sending it, so the reset-link
 * flow stays fully testable without a real mail provider. Set SMTP_HOST/
 * SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in .env for real delivery.
 */
@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  constructor(private readonly logger: LoggerService) {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Reset your Cognify password';
    const text = `We received a request to reset your password. Use the link below within the next hour to choose a new one:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`;

    if (!this.transporter) {
      this.logger.info('SMTP not configured — logging password reset email instead of sending it', {
        to,
        subject,
        resetUrl,
      });
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@cognify.dev',
      to,
      subject,
      text,
    });
  }
}
