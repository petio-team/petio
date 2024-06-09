import {
  GetBandwidthResourceData,
  GetBandwidthResourceResponse,
  GetLibraryTopContentData,
  GetLibraryTopContentResponse,
  GetMetadataChildrenData,
  GetMetadataChildrenResponse,
  GetSessionHistoryData,
  GetStatisticsResourcesData,
  GetStatisticsResourcesResponse,
} from '@/infrastructure/generated/custom/plex-api-client/types';
import {
  BaseHttpRequest,
  CancelablePromise,
  GetSessionHistoryResponse,
  OpenAPIConfig,
  PlexMediaServerV0ApiClient,
} from '@/infrastructure/generated/plex-media-server-api-client';
import { AxiosHttpRequest } from '@/infrastructure/generated/plex-media-server-api-client/core/AxiosHttpRequest';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class PlexMediaServerApiClient extends PlexMediaServerV0ApiClient {
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = AxiosHttpRequest,
  ) {
    super(config, HttpRequest);
  }

  /**
   * Get Items Children
   * This endpoint will return the children of of a library item specified with the ratingKey.
   *
   * @param data The data for the request.
   * @param data.ratingKey the id of the library item to return the children of.
   * @returns unknown The children of the library item.
   * @throws ApiError
   */
  public getMetadataChildren(
    data: GetMetadataChildrenData,
  ): CancelablePromise<GetMetadataChildrenResponse> {
    return this.request.request({
      method: 'GET',
      url: '/library/metadata/{ratingKey}/children',
      path: {
        ratingKey: data.ratingKey,
      },
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  }

  /**
   * Get Session History
   * This will Retrieve a listing of all history views.
   * @returns unknown List of Plex Sessions
   * @throws ApiError
   */
  public getSessionHistory(
    data: GetSessionHistoryData,
  ): CancelablePromise<GetSessionHistoryResponse> {
    return this.request.request({
      method: 'GET',
      url: '/status/sessions/history/all',
      query: {
        accountId: data.accountId,
        sort: 'viewedAt:desc',
        'viewedAt>': data['viewedAt>'],
        librarySectionID: data.librarySectionID,
      },
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  }

  /**
   * Retrieves the bandwidth statistics from the Plex API.
   * @returns A promise that resolves to the bandwidth statistics response.
   */
  public getStatisticsBandwidth(
    data: GetBandwidthResourceData,
  ): CancelablePromise<GetBandwidthResourceResponse> {
    return this.request.request<GetBandwidthResourceResponse>({
      method: 'GET',
      url: '/statistics/bandwidth',
      query: {
        timespan: data.timespan,
      },
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  }

  /**
   * Retrieves statistics resources.
   * @param data - The data for retrieving statistics resources.
   * @returns A cancelable promise that resolves to the response containing the statistics resources.
   */
  public getStatisticsResources(
    data: GetStatisticsResourcesData,
  ): CancelablePromise<GetStatisticsResourcesResponse> {
    return this.request.request<GetStatisticsResourcesResponse>({
      method: 'GET',
      url: '/statistics/resources',
      query: {
        timespan: data.timespan,
      },
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  }

  /**
   * Get Top Watched Content From Libraries
   */
  public getLibraryTopWatched(
    data: GetLibraryTopContentData,
  ): CancelablePromise<GetLibraryTopContentResponse> {
    return this.request.request({
      method: 'GET',
      url: '/library/all/top',
      query: {
        type: data.type,
        'viewedAt>': data['viewedAt>'],
        limit: data.limit,
      },
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  }
}
