/**
 * Converts an object to a query string.
 *
 * @param object - The object to convert.
 * @returns The query string representation of the object.
 */
export const toQueryString = (object: {
  [x: string]: { toString: () => any };
}): string =>
  `?${Object.keys(object)
    .map((key) => `${key}=${object[key].toString()}`)
    .join('&')}`;
