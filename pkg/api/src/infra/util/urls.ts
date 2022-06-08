export const removeSlashes = (str: string): string => {
  return str.replace(/^\/|\/$/g, '');
};
