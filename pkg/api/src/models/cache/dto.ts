import { z } from "zod";

export const CacheDTO = z.object({
  key: z.any(),
  value: z.any(),
  expiry: z.date(),
});
export type Cache = z.infer<typeof CacheDTO>;

export const MakeCache = (cache: Partial<Cache>): Cache => {
  const defaults = CacheDTO.parse({});
  return { ...defaults, ...cache };
};
