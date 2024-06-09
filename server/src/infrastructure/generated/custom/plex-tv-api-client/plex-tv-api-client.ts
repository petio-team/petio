import { GetFriendsDataResponse } from '@/infrastructure/generated/custom/plex-tv-api-client/types';
import {
  BaseHttpRequest,
  CancelablePromise,
  OpenAPIConfig,
  PlexTvV0ApiClient,
} from '@/infrastructure/generated/plex-tv-api-client';
import { AxiosHttpRequest } from '@/infrastructure/generated/plex-tv-api-client/core/AxiosHttpRequest';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class PlexTvApiClient extends PlexTvV0ApiClient {
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = AxiosHttpRequest,
  ) {
    super(config, HttpRequest);
  }

  /**
   * Retrieves the friends associated with the Plex TV client.
   * @returns A cancelable promise that resolves to the response data containing the friends.
   */
  public getFriends(): CancelablePromise<GetFriendsDataResponse> {
    return this.request.request({
      method: 'GET',
      url: '/friends',
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  }
}
