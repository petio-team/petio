import { z } from 'zod';

export const SetupTestInputSchema = z.object({
  server: z.object({
    clientId: z.string().min(1).optional(),
    host: z.string().min(1),
    name: z.string().min(1),
    platform: z.string().min(1),
    port: z
      .string()
      .min(1)
      .transform((v) => parseInt(v)),
    protocol: z.enum(['http', 'https']),
    status: z.string().min(1),
    token: z.string().min(1),
  }),
});
export type SetupTestInput = z.infer<typeof SetupTestInputSchema>;
