import { Model } from "@models/comingsoon/db";
import {
  ComingSoon,
  ComingSoonSchema,
  ComingSoonType,
} from "@models/comingsoon/model";
import { z, defaultEndpointsFactory } from "express-zod-api";

export const comingSoonTVEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({}),
  output: z.object({
    results: z.array(ComingSoonSchema),
  }),
  handler: async () => {
    return {
      results: (await Model.find({
        type: ComingSoonType.Show,
      })) as ComingSoon[],
    };
  },
});
