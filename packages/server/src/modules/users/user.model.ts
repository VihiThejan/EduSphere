import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, USER_ROLES, MarketplaceStatus, MARKETPLACE_STATUS } from '@edusphere/shared';

export interface IUserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  roles: UserRole[];
  profile: IUserProfile;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  refreshTokens: string[];
  isMarketplaceSeller: boolean;
  marketplaceStatus: MarketplaceStatus;
  // Account lockout
  loginAttempts: number;
  lockUntil?: Date;
  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    avatar: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    roles: {
      type: [String],
      enum: Object.values(USER_ROLES),
      default: [USER_ROLES.STUDENT],
      index: true,
    },
    profile: {
      type: userProfileSchema,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    isMarketplaceSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    marketplaceStatus: {
      type: String,
      enum: Object.values(MARKETPLACE_STATUS),
      default: MARKETPLACE_STATUS.ACTIVE,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).passwordHash;
        delete (ret as any).refreshTokens;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Instance methods
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.addRefreshToken = async function (token: string): Promise<void> {
  if (!Array.isArray(this.refreshTokens)) {
    this.refreshTokens = [];
  }
  this.refreshTokens.push(token);
  await this.save();
};

userSchema.methods.removeRefreshToken = async function (token: string): Promise<void> {
  if (!Array.isArray(this.refreshTokens)) {
    this.refreshTokens = [];
  }
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
  await this.save();
};

// Account lockout — lock for 2 hours after 5 consecutive failures
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 2 * 60 * 60 * 1000; // 2 h

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If a previous lock has expired, reset and start fresh
  if (this.lockUntil && this.lockUntil <= new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
  }
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  if (this.loginAttempts !== 0 || this.lockUntil) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
  }
};

// Static methods
userSchema.statics.hashPassword = async function (password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Create text index for search
userSchema.index({ 'profile.firstName': 'text', 'profile.lastName': 'text', email: 'text' });

export const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);
