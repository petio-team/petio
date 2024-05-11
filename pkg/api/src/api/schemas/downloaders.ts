import { z } from 'zod';

enum HttpProtocol {
  Http = 'http',
  Https = 'https',
}

export const ArrInputSchema = z.object({
  id: z.string().optional(),
  enabled: z.boolean(),
  name: z.string().min(1),
  protocol: z.nativeEnum(HttpProtocol),
  host: z.string().min(1),
  port: z.string().transform((p) => parseInt(p, 10)),
  subpath: z.string().min(1).default('/'),
  path: z.object({
    id: z.number(),
    location: z.string(),
  }),
  profile: z.object({
    id: z.number(),
    name: z.string(),
  }),
  language: z.object({
    id: z.number(),
    name: z.string(),
  }),
  availability: z.number().optional(),
  token: z.string().min(1),
});
export type ArrInput = z.infer<typeof ArrInputSchema>;
