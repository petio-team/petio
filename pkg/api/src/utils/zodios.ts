import {
  Method,
  ZodiosEndpointDefinition,
  ZodiosHeaderParamsByPath,
  ZodiosPathsByMethod,
  ZodiosPlugin,
  ZodiosQueryParamsByPath,
} from '@zodios/core';
import {
  Merge,
  PickDefined,
  SetPropsOptionalIfChildrenAreOptional,
} from '@zodios/core/lib/utils.types';
import { AxiosRequestConfig } from 'axios';

export type ZodiosRequestCustomParamsByPath<
  Api extends ZodiosEndpointDefinition[],
  M extends Method,
  Path extends ZodiosPathsByMethod<Api, M>,
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      queries: ZodiosQueryParamsByPath<Api, M, Path>;
      headers: ZodiosHeaderParamsByPath<Api, M, Path>;
    }>
  >,
  Omit<AxiosRequestConfig, 'params' | 'baseURL' | 'data' | 'method' | 'url'>
>;

export function pluginQuery(
  key: string,
  valueFn: () => Promise<string>,
): ZodiosPlugin {
  return {
    request: async (_, config) => ({
      ...config,
      queries: {
        ...config.queries,
        [key]: await valueFn(),
      },
    }),
  };
}
