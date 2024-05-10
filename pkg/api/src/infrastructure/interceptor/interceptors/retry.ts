import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { isNetworkOrIdempotentRequestError } from "../helpers/errors-predicates";
import { MaybePromise } from "../utils/lib/typescript/promise";

const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 1000;

type Delay = number | ((retryCount: number) => number);

export type RetryConfig = {
  count?: number;
  delay?: Delay;
  condition?: (error: AxiosError) => MaybePromise<boolean>;
  onRetry?: <T = any>(error: AxiosError, retryCount: number) => MaybePromise<T>;
};

export type AxiosRetryRequestConfig = AxiosRequestConfig & {
  retry?: RetryConfig | boolean;
};

export type InternalAxiosRetryRequestConfig = AxiosRetryRequestConfig & {
  __retryCount?: number;
};

export const createRetryInterceptor = (
  axiosInstance: AxiosInstance,
  options: RetryConfig = {}
): {
  readonly id: { response: number };
  eject: () => void;
} => {
  const interceptorId = axiosInstance.interceptors.response.use(
    undefined,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRetryRequestConfig;

      if (!config) {
        return Promise.reject(error);
      }

      const {
        count = DEFAULT_RETRY_COUNT,
        delay = DEFAULT_RETRY_DELAY_MS,
        condition = isNetworkOrIdempotentRequestError,
        onRetry,
      } = {
        ...options,
        ...(typeof config.retry === "boolean" ? {} : config.retry),
      };

      if (
        config.retry === false ||
        (config.__retryCount && config.__retryCount >= count) ||
        !(await condition(error))
      ) {
        return Promise.reject(error);
      }

      config.__retryCount = (config.__retryCount || 0) + 1;

      await onRetry?.(error, config.__retryCount!);

      return new Promise(resolve => {
        setTimeout(
          () => resolve(axiosInstance(config)),
          calculateDelay(config.__retryCount!, delay)
        );
      });
    }
  );

  return {
    get id() {
      return { response: interceptorId };
    },
    eject: () => {
      axiosInstance.interceptors.response.eject(interceptorId);
    },
  };
};

function calculateDelay(count: number, delay: Delay) {
  return typeof delay === "function" ? delay(count) : delay;
}
