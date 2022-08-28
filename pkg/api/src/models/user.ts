import { ObjectId } from 'bson';
import { Schema, model } from 'mongoose';
import * as z from 'zod';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export const UserSchema = z.object({
  id: z.instanceof(ObjectId).optional(),
  title: z.string().min(1),
  username: z.string().min(1),
  password: z.string().optional(),
  email: z.string().email().min(1),
  thumbnail: z.string().min(1),
  // altId is now used to tell if an account is custom or not
  altId: z.string().min(1).optional(),
  plexId: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.User),
  profileId: z.string().optional(),
  // owner replaced the old custom field, and inverts it's usage
  owner: z.boolean().default(false),
  custom: z.boolean().default(false),
  disabled: z.boolean().default(false),
  quotaCount: z.number().default(0),
  lastIp: z.string().optional(),
  lastLogin: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

const UserModelSchema = new Schema<User>(
  {
    title: {
      type: String,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    thumbnail: {
      type: String,
    },
    altId: {
      type: String,
    },
    plexId: {
      type: String,
    },
    lastIp: {
      type: String,
    },
    role: {
      type: String,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
    },
    owner: {
      type: Boolean,
    },
    custom: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    quotaCount: {
      type: Number,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret, _options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const UserModel = model<User>('users', UserModelSchema);

// TODO: this should be it's own service with a repository ideally
// Gets all users
export const GetAllUsers = async (): Promise<User[]> => {
  const results = await UserModel.find({});
  if (!results) {
    return [];
  }

  const parsed = await UserSchema.array().safeParseAsync(results);
  if (!parsed.success) {
    throw new Error('failed to parse users data');
  }

  return parsed.data;
};

// TODO: this should be it's own service with a repository ideally
// Get a user by using an email address
export const GetUserByEmail = async (email: string): Promise<User> => {
  const data = await UserModel.findOne({
    email: email,
  });
  if (!data) {
    throw new Error('failed to get user by email');
  }

  const parsed = await UserSchema.safeParseAsync(data.toObject());
  if (!parsed.success) {
    throw new Error('failed to parse and validate data');
  }

  return parsed.data;
};

// Get a user by using an email address
export const GetUserByPlexID = async (id: string): Promise<User> => {
  const data = await UserModel.findOne({
    plexId: id,
  }).exec();
  if (!data) {
    throw new Error('failed to get user by plex id');
  }

  const parsed = await UserSchema.safeParseAsync(data.toObject());
  if (!parsed.success) {
    throw new Error('failed to parse and validate data');
  }

  delete parsed.data.password;
  return parsed.data;
};

// TODO: this should be it's own service with a repository ideally
// Create a new user or update if one already exists
export const CreateOrUpdateUser = async (user: User): Promise<User> => {
  let schema = await UserSchema.safeParseAsync(user);
  if (!schema.success) {
    throw new Error('failed to parse user data');
  }

  const data = await UserModel.updateOne(
    {
      email: user.email,
    },
    schema.data,
    {
      upsert: true,
    },
  );
  if (!data.acknowledged) {
    throw new Error('failed to create or update user');
  }

  schema.data.id = data.upsertedId;

  return schema.data;
};
