import { AxiosError } from "axios";
import isRetryAllowed from "./retry-allowed";

const SAFE_HTTP_METHODS = ["get", "head", "options"];
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(["put", "delete"]);

// Original source for these predicates: https://github.com/softonic/axios-retry

export function isNetworkError(error: AxiosError): boolean {
  return (
    !error.response &&
    Boolean(error.code) && // Prevents retrying cancelled requests
    error.code !== "ECONNABORTED" && // Prevents retrying timed out requests
    isRetryAllowed(error) // Prevents retrying unsafe errors
  );
}

export function isRetryableError(error: AxiosError): boolean {
  return (
    error.code !== "ECONNABORTED" &&
    (!error.response ||
      (error.response.status >= 500 && error.response.status <= 599))
  );
}

export function isSafeRequestError(error: AxiosError): boolean {
  if (!error.config) {
    return false;
  }

  return (
    isRetryableError(error) &&
    SAFE_HTTP_METHODS.includes(error.config.method?.toLowerCase()!)
  );
}

export function isIdempotentRequestError(error: AxiosError): boolean {
  if (!error.config) {
    return false;
  }

  return (
    isRetryableError(error) &&
    IDEMPOTENT_HTTP_METHODS.includes(error.config.method?.toLowerCase()!)
  );
}

export function isNetworkOrIdempotentRequestError(error: AxiosError): boolean {
  return isNetworkError(error) || isIdempotentRequestError(error);
}
