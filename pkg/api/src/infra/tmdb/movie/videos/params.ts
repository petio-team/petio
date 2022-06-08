import { z } from "zod";

export const VideosParams = [
  {
    name: "language",
    type: "Query",
    schema: z.string().optional(),
  },
] as const;
