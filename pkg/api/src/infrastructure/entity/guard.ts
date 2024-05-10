/**
 * Checks if a value is empty.
 * @param value - The value to check.
 * @returns Returns `true` if the value is empty, `false` otherwise.
 */
export const isEmpty = (value: unknown): boolean => {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return false;
  }
  if (typeof value === 'undefined' || value === null) {
    return true;
  }
  if (value instanceof Date) {
    return false;
  }
  if (value instanceof Object && !Object.keys(value).length) {
    return true;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return true;
    }
    if (value.every((item) => isEmpty(item))) {
      return true;
    }
  }
  if (value === '') {
    return true;
  }

  return false;
}
