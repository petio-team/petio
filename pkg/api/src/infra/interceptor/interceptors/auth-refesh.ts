import { AxiosError, AxiosInstance } from "axios";
import authRefreshInterceptor, {
  AxiosAuthRefreshOptions,
  AxiosAuthRefreshRequestConfig as _AxiosAuthRefreshRequestConfig,
} from "axios-auth-refresh";

import { MaybePromise } from "../utils/lib/typescript/promise";

export type AxiosAuthRefreshRequestConfig = _AxiosAuthRefreshRequestConfig;

export type AuthRefreshOptions = AxiosAuthRefreshOptions & {
  onRefresh: (error: AxiosError) => MaybePromise<any>;
};

export function createAuthRefreshInterceptor(
  axiosInstance: AxiosInstance,
  options: AuthRefreshOptions
): {
  readonly id: { response: number };
  eject: () => void;
} {
  // FIX: Import issues for different module resolutions
  const authRefreshInterceptorFn =
    typeof authRefreshInterceptor === "object"
      ? (authRefreshInterceptor as any).default
      : authRefreshInterceptor;

  const interceptorId = authRefreshInterceptorFn(
    axiosInstance,
    options.onRefresh,
    options
  );
  return {
    get id() {
      return { response: interceptorId };
    },
    eject: () => {
      axiosInstance.interceptors.request.eject(interceptorId);
    },
  };
}
