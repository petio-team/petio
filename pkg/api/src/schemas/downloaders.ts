import { z } from "zod";

enum HttpProtocol {
  Http = 'http',
  Https = 'https',
}

export const ArrInputSchema = z.object({
  enabled: z.boolean(),
  name: z.string().min(1),
  protocol: z.nativeEnum(HttpProtocol),
  host: z.string().min(1),
  port: z.number(),
  subpath: z.string().min(1).default('/'),
  path: z.number(),
  profile: z.number(),
  language: z.number(),
  availability: z.number(),
  token: z.string().min(1),
});
export type ArrInput = z.infer<typeof ArrInputSchema>;
