import { z } from 'zod';

export const ErrorSchema = z.object({
  status: z.number(),
  error: z.string(),
});
export type Error = z.infer<typeof ErrorSchema>;

export const ErrorsSchema = z.object({
  errors: z.array(
    z.object({
      code: z.number(),
      message: z.string(),
      status: z.number(),
    }),
  ),
});
