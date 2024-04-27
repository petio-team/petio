import { makeApi } from '@zodios/core';
import { z } from 'zod';
import { APIError } from './errors';

export const PinsSchema = z.object({
  id: z.number(),
  code: z.string(),
  product: z.string(),
  trusted: z.boolean(),
  qr: z.string(),
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
export type Pins = z.infer<typeof PinsSchema>;

export const PinsEndpoint = makeApi([
  {
    description: 'makes a request to generate a new pin',
    method: 'post',
    path: '/api/v2/pins',
    parameters: [
      {
        description: 'generates a pin stronger version of the default pin',
        name: 'strong',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        description: 'plex client id',
        name: 'x-plex-client-identifier',
        type: 'Header',
        schema: z.string().uuid().min(1),
      },
    ],
    response: PinsSchema,
    err: APIError,
  },
  {
    description: 'get the access token by pin id',
    method: 'get',
    path: '/api/v2/pins/:id',
    parameters: [
      {
        description: 'plex client id',
        name: 'x-plex-client-identifier',
        type: 'Header',
        schema: z.string().uuid().min(1),
      },
    ],
    response: PinsSchema,
    err: APIError,
  },
]);
