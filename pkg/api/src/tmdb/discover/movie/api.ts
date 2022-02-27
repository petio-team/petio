import { asApi } from "zodios";
import { Parameters } from "./params";
import { MovieSchema } from "./schema";

export const MovieAPI = asApi([
    {
        method: "get",
        path: "/discover/movie",
        parameters: Parameters,
        response: MovieSchema,
    }
] as const);