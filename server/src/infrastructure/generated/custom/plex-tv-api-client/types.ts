/**
 * Represents the response data for getting friends data.
 */
export type GetFriendsDataResponse = Array<{
  status: string;
  sharedServers: Array<any>;
  sharedSources: Array<any>;
  id: number;
  uuid: string;
  title: string;
  username: string;
  restricted: boolean;
  email: string;
  friendlyName?: string;
  thumb: string;
  home: boolean;
}>;

/**
 * Represents the response object for getting user details.
 */
export type GetUserDetailsResponse = {
  id: number;
  uuid: string;
  username: string;
  title: string;
  email: string;
  friendlyName: string;
  locale: any;
  confirmed: boolean;
  joinedAt: number;
  emailOnlyAuth: boolean;
  hasPassword: boolean;
  protected: boolean;
  thumb: string;
  authToken: string;
  mailingListStatus: string;
  mailingListActive: boolean;
  scrobbleTypes: string;
  country: string;
  subscription: {
    active: boolean;
    subscribedAt: string;
    status: string;
    paymentService: string;
    plan: string;
    features: Array<string>;
  };
  subscriptionDescription: string;
  restricted: boolean;
  anonymous: boolean;
  home: boolean;
  guest: boolean;
  homeSize: number;
  homeAdmin: boolean;
  maxHomeSize: number;
  rememberExpiresAt: number;
  profile: {
    autoSelectAudio: boolean;
    defaultAudioLanguage: string;
    defaultSubtitleLanguage: string;
    autoSelectSubtitle: number;
    defaultSubtitleAccessibility: number;
    defaultSubtitleForced: number;
    watchedIndicator: number;
  };
  entitlements: Array<string>;
  roles: Array<string>;
  services: Array<{
    identifier: string;
    endpoint: string;
    token?: string;
    secret?: string;
    status: string;
  }>;
  adsConsent: any;
  adsConsentSetAt: any;
  adsConsentReminderAt: any;
  experimentalFeatures: boolean;
  twoFactorEnabled: boolean;
  backupCodesCreated: boolean;
};
