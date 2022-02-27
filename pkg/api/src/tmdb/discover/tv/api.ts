import { asApi } from "zodios";
import { Parameters } from "./params";
import { TVSchema } from "./schema";

export const TVAPI = asApi([
    {
        method: "get",
        path: "/discover/tv",
        parameters: Parameters,
        response: TVSchema,
    }
] as const);