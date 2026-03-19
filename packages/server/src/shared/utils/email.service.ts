/**
 * Email Service
 *
 * Development  → Ethereal (free fake SMTP, preview at https://ethereal.email)
 * Production   → Real SMTP (set SMTP_HOST, SMTP_USER, SMTP_PASS env vars)
 *                Gmail works: use an App Password (no paid plan needed)
 */
import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from './logger.js';

class EmailService {
  private transporter: Transporter | null = null;
  private initialized = false;

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter && this.initialized) return this.transporter;

    if (config.email.host) {
      // Real SMTP (Gmail / SendGrid free tier / any provider)
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    } else {
      // Development fallback: Ethereal (auto-generated test account)
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Ethereal test email account created: ${testAccount.user}`);
      logger.info('Preview emails at: https://ethereal.email/messages');
    }

    this.initialized = true;
    return this.transporter;
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Reset your EduSphere password</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 28px;background:#1e293b;color:#fff;
                  text-decoration:none;border-radius:6px;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px;">
          Or copy this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#3b82f6;">${resetUrl}</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject: 'EduSphere — Reset your password',
      html,
    });

    // In dev, log the Ethereal preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Password reset email preview: ${previewUrl}`);
    }
  }

  async sendEmailVerificationEmail(to: string, verificationToken: string): Promise<void> {
    const verifyUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Verify your EduSphere email</h2>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 28px;background:#1e293b;color:#fff;
                  text-decoration:none;border-radius:6px;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px;">
          Or copy this link into your browser:<br/>
          <a href="${verifyUrl}" style="color:#3b82f6;">${verifyUrl}</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">This link expires in 24 hours.</p>
      </div>
    `;

    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject: 'EduSphere — Verify your email address',
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Email verification preview: ${previewUrl}`);
    }
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome to EduSphere, ${firstName}!</h2>
        <p>Your account is ready. Start learning or teaching today.</p>
        <a href="${config.clientUrl}/dashboard"
           style="display:inline-block;padding:12px 28px;background:#1e293b;color:#fff;
                  text-decoration:none;border-radius:6px;font-weight:600;margin:16px 0">
          Go to Dashboard
        </a>
      </div>
    `;

    const transporter = await this.getTransporter();
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject: 'Welcome to EduSphere!',
      html,
    });
  }
}

export const emailService = new EmailService();
