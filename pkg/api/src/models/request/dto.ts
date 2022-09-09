import { randomUUID } from 'crypto';
import { z } from 'zod';

import { MediaServerDTO } from '../mediaserver/dto';
import { UserDTO } from '../user/dto';

export enum RequestType {
  Movie = 'movie',
  TV = 'tv',
}

export enum RequestStatus {
  None = 0,
  Requested = 1,
  Approved = 2,
  Processing = 3,
  Finialising = 4,
  Complete = 5,
  Rejected = 6,
}

export const RequestDTO = z.object({
  id: z.string().default(randomUUID()),
  type: z.nativeEnum(RequestType),
  title: z.string(),
  thumbnail: z.string(),
  tmdbid: z.number(),
  users: z.union([UserDTO.array(), z.string().array()]).optional(),
  mediaservers: z
    .union([MediaServerDTO.array(), z.string().array()])
    .optional(),
  seasons: z.number().array().optional(),
  status: z.union([z.nativeEnum(RequestStatus), z.null()]).optional(),
  approved: z.boolean().optional().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});
export type Request = z.infer<typeof RequestDTO>;

// Make a request object with default values applied
export const MakeRequest = (request?: Partial<Request>): Request => {
  const defaults = RequestDTO.parse({});
  return { ...defaults, ...request };
};
