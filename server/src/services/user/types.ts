import { UserRole } from '@/resources/user/types';

export type CreateUserProps = {
  username: string;
  email: string;
  title: string;
  password: string;
  linked: string;
};

export type UpdateUserProps = {
  id: string;
  clearPassword?: boolean;
  password?: string;
  email?: string;
  profile?: string;
  role?: UserRole;
  disabled?: boolean;
};

export type UpdateMultipleUserProps = {
  ids: string[];
  enabled?: boolean;
  profile?: string;
};
