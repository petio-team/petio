// This file is auto-generated by @hey-api/openapi-ts

export type GetCompanionsDataResponse = Array<{
  identifier?: string;
  baseURL?: string;
  title?: string;
  linkURL?: string;
  provides?: string;
  token?: string;
}>;

export type GetGeoDataResponse = {
  id?: number;
  name?: string;
  guestUserID?: number;
  guestUserUUID?: string;
  guestEnabled?: boolean;
  subscription?: boolean;
};

export type GetHomeDataResponse = {
  id?: number;
  name?: string;
  guestUserID?: number;
  guestUserUUID?: string;
  guestEnabled?: boolean;
  subscription?: boolean;
};

export type GetPinData = {
  /**
   * Determines the kind of code returned by the API call
   * Strong codes are used for Pin authentication flows
   * Non-Strong codes are used for `Plex.tv/link`
   *
   */
  strong?: boolean;
};

export type GetPinResponse = {
  /**
   * PinID for use with authentication
   */
  id?: number;
  code?: string;
  product?: string;
  trusted?: boolean;
  /**
   * a link to a QR code hosted on plex.tv
   * The QR code redirects to the relevant `plex.tv/link` authentication page
   * Which then prompts the user for the 4 Digit Link Pin
   *
   */
  qr?: string;
  clientIdentifier?: string;
  location?: {
    code?: string;
    european_union_member?: boolean;
    continent_code?: string;
    country?: string;
    city?: string;
    time_zone?: string;
    postal_code?: number;
    in_privacy_restricted_country?: boolean;
    subdivisions?: string;
    coordinates?: string;
  };
  expiresIn?: number;
  createdAt?: string;
  expiresAt?: string;
  authToken?: string;
  newRegistration?: string;
};

export type GetTokenData = {
  /**
   * The PinID to retrieve an access token for
   */
  pinId: string;
};

export type GetTokenResponse = unknown;

export type GetDevicesData = {
  /**
   * Include Https entries in the results
   */
  includeHttps?: 0 | 1;
  /**
   * Include IPv6 entries in the results
   */
  includeIpv6?: 0 | 1;
  /**
   * Include Relay addresses in the results
   */
  includeRelay?: 0 | 1;
  clientIdentifier?: string;
};

export type GetDevicesResponse = Array<{
  name?: string;
  product?: string;
  productVersion?: string;
  platform?: string;
  platformVersion?: string;
  device?: string;
  clientIdentifier?: string;
  createdAt?: string;
  lastSeenAt?: string;
  provides?: string;
  ownerId?: string;
  sourceTitle?: string;
  publicAddress?: string;
  accessToken?: string;
  owned?: boolean;
  home?: boolean;
  synced?: boolean;
  relay?: boolean;
  presence?: boolean;
  httpsRequired?: boolean;
  publicAddressMatches?: boolean;
  dnsRebindingProtection?: boolean;
  natLoopbackSupported?: boolean;
  connections?: Array<{
    protocol?: string;
    address?: string;
    port?: number;
    uri?: string;
    local?: boolean;
    relay?: boolean;
    IPv6?: boolean;
  }>;
}>;

export type GetUserDetailsResponse = unknown;

export type GetUserSettingsResponse = Array<{
  id?: string;
  type?: string;
  value?: string;
  hidden?: boolean;
  updatedAt?: number;
}>;

export type GetUserOptOutSettingsResponse = {
  'tv.plex.provider.podcasts'?: string;
  'tv.plex.provider.news'?: string;
  'tv.plex.provider.webshows'?: string;
  'tv.plex.provider.music'?: string;
  'tv.plex.provider.vod'?: string;
  scrobbling?: string;
};

export type $OpenApiTs = {
  '/companions': {
    get: {
      res: {
        /**
         * Companions Data
         */
        200: Array<{
          identifier?: string;
          baseURL?: string;
          title?: string;
          linkURL?: string;
          provides?: string;
          token?: string;
        }>;
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/geoip': {
    get: {
      res: {
        /**
         * Geo Data
         */
        200: {
          id?: number;
          name?: string;
          guestUserID?: number;
          guestUserUUID?: string;
          guestEnabled?: boolean;
          subscription?: boolean;
        };
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/home': {
    get: {
      res: {
        /**
         * Home Data
         */
        200: {
          id?: number;
          name?: string;
          guestUserID?: number;
          guestUserUUID?: string;
          guestEnabled?: boolean;
          subscription?: boolean;
        };
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/pins': {
    post: {
      req: {
        /**
         * Determines the kind of code returned by the API call
         * Strong codes are used for Pin authentication flows
         * Non-Strong codes are used for `Plex.tv/link`
         *
         */
        strong?: boolean;
      };
      res: {
        /**
         * The Pin
         */
        200: {
          /**
           * PinID for use with authentication
           */
          id?: number;
          code?: string;
          product?: string;
          trusted?: boolean;
          /**
           * a link to a QR code hosted on plex.tv
           * The QR code redirects to the relevant `plex.tv/link` authentication page
           * Which then prompts the user for the 4 Digit Link Pin
           *
           */
          qr?: string;
          clientIdentifier?: string;
          location?: {
            code?: string;
            european_union_member?: boolean;
            continent_code?: string;
            country?: string;
            city?: string;
            time_zone?: string;
            postal_code?: number;
            in_privacy_restricted_country?: boolean;
            subdivisions?: string;
            coordinates?: string;
          };
          expiresIn?: number;
          createdAt?: string;
          expiresAt?: string;
          authToken?: string;
          newRegistration?: string;
        };
        /**
         * X-Plex-Client-Identifier is missing
         */
        400: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/pins/{pinID}': {
    get: {
      req: {
        /**
         * The PinID to retrieve an access token for
         */
        pinId: string;
      };
      res: {
        /**
         * Access Token
         */
        200: unknown;
        /**
         * X-Plex-Client-Identifier is missing
         */
        400: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/resources': {
    get: {
      req: {
        /**
         * Include Https entries in the results
         */
        includeHttps?: 0 | 1;
        /**
         * Include IPv6 entries in the results
         */
        includeIpv6?: 0 | 1;
        /**
         * Include Relay addresses in the results
         */
        includeRelay?: 0 | 1;
      };
      res: {
        /**
         * List of Plex Devices
         */
        200: Array<{
          name?: string;
          product?: string;
          productVersion?: string;
          platform?: string;
          platformVersion?: string;
          device?: string;
          clientIdentifier?: string;
          createdAt?: string;
          lastSeenAt?: string;
          provides?: string;
          ownerId?: string;
          sourceTitle?: string;
          publicAddress?: string;
          accessToken?: string;
          owned?: boolean;
          home?: boolean;
          synced?: boolean;
          relay?: boolean;
          presence?: boolean;
          httpsRequired?: boolean;
          publicAddressMatches?: boolean;
          dnsRebindingProtection?: boolean;
          natLoopbackSupported?: boolean;
          connections?: Array<{
            protocol?: string;
            address?: string;
            port?: number;
            uri?: string;
            local?: boolean;
            relay?: boolean;
            IPv6?: boolean;
          }>;
        }>;
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/user': {
    get: {
      res: {
        /**
         * Logged in user details
         */
        200: unknown;
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/user/settings': {
    get: {
      res: {
        /**
         * User Settings
         */
        200: Array<{
          id?: string;
          type?: string;
          value?: string;
          hidden?: boolean;
          updatedAt?: number;
        }>;
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
  '/user/settings/opt_outs': {
    get: {
      res: {
        /**
         * User Opt Out Settings
         */
        200: {
          'tv.plex.provider.podcasts'?: string;
          'tv.plex.provider.news'?: string;
          'tv.plex.provider.webshows'?: string;
          'tv.plex.provider.music'?: string;
          'tv.plex.provider.vod'?: string;
          scrobbling?: string;
        };
        /**
         * Bad Request - A parameter was not specified, or was specified incorrectly.
         */
        400: unknown;
        /**
         * Unauthorized - Returned if the X-Plex-Token is missing from the header or query.
         */
        401: {
          errors?: Array<{
            code?: number;
            message?: string;
            status?: number;
          }>;
        };
      };
    };
  };
};