import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { UserModel, IUser } from '../users/user.model.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../../shared/utils/errors.js';
import { UserRole, DecodedToken } from '@edusphere/shared';

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
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await (UserModel as any).hashPassword(input.password);

    // Create user
    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      roles: input.roles || ['student'],
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await user.addRefreshToken(tokens.refreshToken);

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Find user with password
    const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await user.addRefreshToken(tokens.refreshToken);

    // Remove password from response
    user.passwordHash = undefined as any;

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as DecodedToken;

      // Find user with refresh tokens
      const user = await UserModel.findById(decoded.userId).select('+refreshTokens');
      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Check if refresh token exists in user's tokens
      if (!user.refreshTokens.includes(refreshToken)) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Remove old refresh token
      await user.removeRefreshToken(refreshToken);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Save new refresh token
      await user.addRefreshToken(tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await UserModel.findById(userId).select('+refreshTokens');
    if (!user) {
      throw new NotFoundError('User');
    }

    await user.removeRefreshToken(refreshToken);
  }

  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  private async generateTokens(user: IUser): Promise<AuthTokens> {
    const payload: Omit<DecodedToken, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
