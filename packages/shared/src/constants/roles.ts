export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLES_ARRAY = Object.values(USER_ROLES);
