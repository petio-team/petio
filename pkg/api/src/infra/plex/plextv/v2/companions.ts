import { makeApi } from "@zodios/core";
import { z } from "zod";
import { commonSharedHeaders } from "./common";

export const CompanionsSchema = z.object({
  identifier: z.string(),
  baseURL: z.string(),
  title: z.string(),
  linkURL: z.string(),
  provides: z.string(),
  token: z.string()
});
export type Companions = z.infer<typeof CompanionsSchema>;

export const CompanionsEndpoint = makeApi([
  {
    description: "gets companions",
    method: "get",
    path: "/api/v2/companions",
    parameters: [
      ...commonSharedHeaders,
    ],
    response: CompanionsSchema,
  }
]);
