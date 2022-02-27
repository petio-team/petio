import { asApi } from "zodios";
import { MovieAPI } from "./movie/api";
import { TVAPI } from "./tv/api";

export const DiscoverAPI = asApi([
    ...TVAPI,
    ...MovieAPI,
] as const);