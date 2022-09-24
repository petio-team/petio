import { z } from 'zod';

export const MinimumAvailabilitySchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type MinimumAvailability = z.infer<typeof MinimumAvailabilitySchema>;
