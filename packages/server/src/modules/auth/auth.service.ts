import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config/index.js';
import { UserModel, IUser } from '../users/user.model.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/utils/errors.js';
import { UserRole, DecodedToken } from '@edusphere/shared';
import { emailService } from '../../shared/utils/email.service.js';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: UserRole[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await (UserModel as any).hashPassword(input.password);

    // Generate email verification token
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = crypto
      .createHash('sha256')
      .update(rawVerifyToken)
      .digest('hex');

    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      roles: input.roles || ['student'],
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
      },
      emailVerificationToken: hashedVerifyToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    const tokens = await this.generateTokens(user);
    await user.addRefreshToken(tokens.refreshToken);

    // Send verification email (non-blocking — don't fail registration if email fails)
    emailService
      .sendEmailVerificationEmail(user.email, rawVerifyToken)
      .catch(() => { /* email errors are non-fatal */ });

    // Send welcome email
    emailService
      .sendWelcomeEmail(user.email, user.profile.firstName)
      .catch(() => { /* email errors are non-fatal */ });

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await UserModel.findOne({ email: input.email }).select(
      '+passwordHash +refreshTokens +loginAttempts +lockUntil'
    );

    if (!user) {
      // Timing-safe: simulate bcrypt work even on unknown email
      await bcrypt.compare(input.password, '$2a$10$invalidhashinvalidhashinvalidhash00000000000000');
      throw new AuthenticationError('Invalid email or password');
    }

    // Check account lock
    if (user.isLocked()) {
      const minutesLeft = Math.ceil(
        ((user.lockUntil?.getTime() ?? 0) - Date.now()) / 60_000
      );
      throw new AuthenticationError(
        `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
      );
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      const remaining = Math.max(0, 5 - user.loginAttempts);
      throw new AuthenticationError(
        remaining > 0
          ? `Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'Account locked due to too many failed attempts. Try again in 2 hours.'
      );
    }

    // Successful login — reset counter
    await user.resetLoginAttempts();

    const tokens = await this.generateTokens(user);
    await user.addRefreshToken(tokens.refreshToken);

    user.passwordHash = undefined as any;

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as DecodedToken;

      const user = await UserModel.findById(decoded.userId).select('+refreshTokens');
      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      if (!user.refreshTokens.includes(refreshToken)) {
        // Token not found → possible theft; wipe ALL tokens (token family invalidation)
        user.refreshTokens = [];
        await user.save();
        throw new AuthenticationError('Invalid refresh token');
      }

      await user.removeRefreshToken(refreshToken);
      const tokens = await this.generateTokens(user);
      await user.addRefreshToken(tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await UserModel.findById(userId).select('+refreshTokens');
    if (!user) throw new NotFoundError('User');
    await user.removeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshTokens: [] });
  }

  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  /**
   * Generates a password-reset token, stores its hash in the DB,
   * and sends a reset email to the user.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    // Always respond with success even if email not found (prevents enumeration)
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(email, rawToken);
  }

  /**
   * Validates the raw reset token from the email link and sets the new password.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

    if (!user) {
      throw new ValidationError('Password reset token is invalid or has expired');
    }

    user.passwordHash = await (UserModel as any).hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Invalidate all existing sessions after password change (security best practice)
    user.refreshTokens = [];
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  /**
   * Verifies the email address using the token from the verification email.
   */
  async verifyEmail(rawToken: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await UserModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      throw new ValidationError('Email verification token is invalid or has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  /**
   * Re-sends the email verification link to an unverified user.
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (user.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendEmailVerificationEmail(user.email, rawToken);
  }

  private async generateTokens(user: IUser): Promise<AuthTokens> {
    const payload: Omit<DecodedToken, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();

