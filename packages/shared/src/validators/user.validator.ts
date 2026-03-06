import { z } from 'zod';
import { USER_ROLES, ROLES_ARRAY } from '../constants/roles';

export const userProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const userRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  roles: z.array(z.enum([USER_ROLES.STUDENT, USER_ROLES.TUTOR, USER_ROLES.SELLER, USER_ROLES.ADMIN])).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userUpdateSchema = z.object({
  profile: userProfileSchema.partial().optional(),
  email: z.string().email().optional(),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
