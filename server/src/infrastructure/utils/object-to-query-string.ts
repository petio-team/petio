import is from '@/infrastructure/utils/is';

/**
 * Converts an object to a query string.
 *
 * @param object - The object to convert.
 * @returns The query string representation of the object.
 */
export const toQueryString = (obj: {
  [x: string]: { toString: () => any };
}): string =>
  `?${Object.entries(obj)
    .filter(([, val]) => is.truthy(val))
    .map(([key, val]) => `${key}=${val}`)
    .join('&')}`;
