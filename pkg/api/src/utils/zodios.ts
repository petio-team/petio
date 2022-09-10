import { ZodiosPlugin } from '@zodios/core';

export function pluginQuery(
  key: string,
  valueFn: () => Promise<string>,
): ZodiosPlugin {
  return {
    request: async (_, config) => {
      return {
        ...config,
        queries: {
          ...config.queries,
          [key]: await valueFn(),
        },
      };
    },
  };
}
