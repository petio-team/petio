import { Override } from '@/infrastructure/utils/override';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * Represents the properties of a User.
 */
export type UserProps = {
  title: string;
  username: string;
  password?: string;
  email: string;
  thumbnail?: string;
  customThumbnail?: boolean;
  altId?: string;
  plexId?: string;
  lastIp?: string;
  role: UserRole;
  owner: boolean;
  custom: boolean;
  disabled: boolean;
  quotaCount: number;
  lastLogin?: Date;
  profileId?: string;
};

/**
 * Represents the properties for creating a User.
 */
export type CreateUserProps = Override<
  UserProps,
  {
    role?: UserRole;
    owner?: boolean;
    custom?: boolean;
    disabled?: boolean;
    quotaCount?: number;
  }
>;
