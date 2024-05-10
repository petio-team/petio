import { AxiosInstance } from "axios";
import {
  AxiosCacheInstance,
  CacheAxiosResponse,
  CacheOptions as AxiosCacheOptions,
  CacheProperties,
  CacheRequestConfig,
  buildMemoryStorage,
  defaultHeaderInterpreter,
  defaultKeyGenerator,
  defaultRequestInterceptor,
  defaultResponseInterceptor,
  isStorage,
} from "axios-cache-interceptor";

export type AxiosCacheRequestConfig<R = any, D = any> = CacheRequestConfig<
  R,
  D
>;
export type AxiosCacheResponse<R = any, D = any> = CacheAxiosResponse<R, D>;

export type CacheOptions = AxiosCacheOptions;

export function createCacheInterceptor(
  axiosInstance: AxiosInstance,
  options: CacheOptions = {}
): {
  readonly id: { response: number; request: number };
  eject: () => void;
} {
  const axiosCache = axiosInstance as AxiosCacheInstance;

  if (axiosCache.defaults.cache) {
    throw new Error("setupCache() should be called only once");
  }

  axiosCache.storage = options.storage || buildMemoryStorage();

  if (!isStorage(axiosCache.storage)) {
    throw new Error("Use buildStorage() function");
  }

  axiosCache.waiting = options.waiting || {};

  axiosCache.generateKey = options.generateKey || defaultKeyGenerator;

  axiosCache.headerInterpreter =
    options.headerInterpreter || defaultHeaderInterpreter;

  axiosCache.requestInterceptor =
    options.requestInterceptor || defaultRequestInterceptor(axiosCache);

  axiosCache.responseInterceptor =
    options.responseInterceptor || defaultResponseInterceptor(axiosCache);

  axiosCache.debug = options.debug;

  // CacheRequestConfig values
  axiosCache.defaults.cache = {
    update: options.update || {},

    ttl: options.ttl ?? 1000 * 60 * 5,

    methods: options.methods || ["get"],

    cachePredicate: options.cachePredicate || {
      statusCheck: status => status >= 200 && status < 400,
    },

    etag: options.etag ?? true,

    // This option is going to be ignored by servers when ETag is enabled
    // Checks strict equality to false to avoid undefined-ish values
    modifiedSince: options.modifiedSince ?? options.etag === false,

    interpretHeader: options.interpretHeader ?? true,

    cacheTakeover: options.cacheTakeover ?? true,

    staleIfError: options.staleIfError ?? true,

    override: false,

    hydrate: undefined,
  } as CacheProperties;

  // Apply interceptors
  const requestInterceptorId =
    axiosCache.requestInterceptor.apply() as unknown as number;
  const responseInterceptorId =
    axiosCache.responseInterceptor.apply() as unknown as number;

  return {
    get id() {
      return {
        request: requestInterceptorId,
        response: responseInterceptorId,
      };
    },
    eject: () => {
      axiosInstance.interceptors.request.eject(requestInterceptorId);
      axiosInstance.interceptors.request.eject(responseInterceptorId);
    },
  };
}
