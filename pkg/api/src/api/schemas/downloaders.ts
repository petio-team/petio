import { z } from "zod";

enum HttpProtocol {
  Http = 'http',
  Https = 'https',
}

export const ArrInputSchema = z.array(
  z.object({
    enabled: z.boolean(),
    name: z.string().min(1),
    protocol: z.nativeEnum(HttpProtocol),
    host: z.string().min(1),
    port: z.number(),
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
    availability: z.object({
      id: z.number(),
      name: z.string(),
    }),
    token: z.string().min(1),
  }),
);
export type ArrInput = z.infer<typeof ArrInputSchema>;
