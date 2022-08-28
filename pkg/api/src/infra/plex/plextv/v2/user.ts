import { asApi } from '@zodios/core';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  username: z.string(),
  title: z.string(),
  email: z.string(),
  friendlyName: z.string(),
  locale: z.null(),
  confirmed: z.boolean(),
  emailOnlyAuth: z.boolean(),
  hasPassword: z.boolean(),
  protected: z.boolean(),
  thumb: z.string(),
  authToken: z.string(),
  mailingListStatus: z.string(),
  mailingListActive: z.boolean(),
  scrobbleTypes: z.string(),
  country: z.string(),
  pin: z.string(),
  subscription: z.object({
    active: z.boolean(),
    subscribedAt: z.string(),
    status: z.string(),
    paymentService: z.string(),
    plan: z.string(),
    features: z.array(z.string()),
  }),
  subscriptionDescription: z.string(),
  restricted: z.boolean(),
  anonymous: z.null(),
  home: z.boolean(),
  guest: z.boolean(),
  homeSize: z.number(),
  homeAdmin: z.boolean(),
  maxHomeSize: z.number(),
  certificateVersion: z.number(),
  rememberExpiresAt: z.number(),
  profile: z.object({
    autoSelectAudio: z.boolean(),
    defaultAudioLanguage: z.string(),
    defaultSubtitleLanguage: z.string(),
    autoSelectSubtitle: z.number(),
    defaultSubtitleAccessibility: z.number(),
    defaultSubtitleForced: z.number(),
  }),
  entitlements: z.array(z.string()),
  roles: z.array(z.string()),
  services: z.array(
    z.union([
      z.object({
        identifier: z.string(),
        endpoint: z.string(),
        token: z.string(),
        status: z.string(),
      }),
      z.object({
        identifier: z.string(),
        endpoint: z.string(),
        status: z.string(),
      }),
      z.object({
        identifier: z.string(),
        endpoint: z.string(),
        token: z.string(),
        secret: z.string(),
        status: z.string(),
      }),
    ]),
  ),
  adsConsent: z.null(),
  adsConsentSetAt: z.null(),
  adsConsentReminderAt: z.null(),
  experimentalFeatures: z.boolean(),
  twoFactorEnabled: z.boolean(),
  backupCodesCreated: z.boolean(),
});
export type User = z.infer<typeof UserSchema>;

export const UserEndpoint = asApi([
  {
    description: 'gets a list of users associated with a plex server',
    method: 'get',
    path: '/api/v2/user',
    parameters: [
      {
        description: 'plex token',
        name: 'x-plex-token',
        type: 'Header',
        schema: z.string().min(1),
      },
    ],
    response: UserSchema,
  },
  {
    description: 'signs a user into plex',
    method: 'post',
    path: '/api/v2/users/signin',
    parameters: [
      {
        description: 'plex client id',
        name: 'x-plex-client-identifier',
        type: 'Header',
        schema: z.string().uuid().min(1),
      },
      {
        name: 'content-type',
        type: 'Header',
        schema: z.string().default('application/x-www-form-urlencoded'),
      },
    ],
    response: UserSchema,
  },
] as const);
