import { randomUUID } from 'crypto';
import { z } from 'zod';

export const DiscoveryDTO = z.object({
  id: z.string().default(randomUUID()),
});
