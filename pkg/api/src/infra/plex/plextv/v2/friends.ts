import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const FriendsSchema = z.object({
  id: z.number(),
  code: z.string(),
  product: z.string(),
  trusted: z.boolean(),
  clientIdentifier: z.string(),
  location: z.object({
    code: z.string(),
    european_union_member: z.boolean(),
    continent_code: z.string(),
    country: z.string(),
    city: z.string(),
    time_zone: z.string(),
    postal_code: z.string(),
    in_privacy_restricted_country: z.boolean(),
    subdivisions: z.string(),
    coordinates: z.string(),
  }),
  expiresIn: z.number(),
  createdAt: z.string(),
  expiresAt: z.string(),
  authToken: z.null(),
  newRegistration: z.null(),
});
export type Friends = z.infer<typeof FriendsSchema>;

export const FriendsEndpoint = makeApi([
  {
    description: 'Gets a list of users associated with a plex server',
    method: 'get',
    path: '/api/v2/friends',
    parameters: [
      {
        description: 'plex token',
        name: 'x-plex-token',
        type: 'Header',
        schema: z.string().min(1),
      },
    ],
    response: FriendsSchema,
  },
]);
