import { makeApi } from "@zodios/core";
import { z } from "zod";
import { commonSharedHeaders } from "./common";

export const GeoDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  guestUserID: z.number(),
  guestUserUUID: z.string(),
  guestEnabled: z.boolean(),
  subscription: z.boolean()
})
export type GeoData = z.infer<typeof GeoDataSchema>;

export const GeoDataEndpoint = makeApi([
  {
    description: "gets geodata",
    method: "get",
    path: "/api/v2/geoip",
    parameters: [
      ...commonSharedHeaders,
    ],
    response: GeoDataSchema,
  }
]);
