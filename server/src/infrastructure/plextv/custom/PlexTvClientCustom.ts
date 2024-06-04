import { PlexTvClient } from '@/infrastructure/plextv/PlexTvClient';
import { AxiosHttpRequest } from '@/infrastructure/plextv/core/AxiosHttpRequest';
import { BaseHttpRequest } from '@/infrastructure/plextv/core/BaseHttpRequest';
import { CancelablePromise } from '@/infrastructure/plextv/core/CancelablePromise';
import { OpenAPIConfig } from '@/infrastructure/plextv/core/OpenAPI';
import { GetFriendsDataResponse } from '@/infrastructure/plextv/custom/types';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class PlexTvClientCustom extends PlexTvClient {
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
