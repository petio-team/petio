import { string, z } from 'zod';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export const UserDTO = z.object({
  id: string().optional(),
  title: z.string().min(1),
  username: z.string().min(1),
  password: z.string().optional(),
  email: z.string().email().min(1),
  thumbnail: z.string().min(1),
  altId: z.string().min(1).optional(),
  plexId: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.User),
  profileId: z.string().optional(),
  owner: z.boolean().default(false),
  custom: z.boolean().default(false),
  disabled: z.boolean().default(false),
  quotaCount: z.number().default(0),
  lastIp: z.string().optional(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});
export type User = z.infer<typeof UserDTO>;

// Make a user object with default values applied
export const MakeUser = (user?: Partial<User>): User => {
  const defaults = UserDTO.parse({});
  return { ...defaults, ...user };
};
