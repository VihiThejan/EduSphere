import { UserRole } from '../constants/roles';

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

export interface User {
  _id: string;
  email: string;
  roles: UserRole[];
  profile: UserProfile;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: UserRole[];
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}

export interface DecodedToken {
  userId: string;
  email: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}
