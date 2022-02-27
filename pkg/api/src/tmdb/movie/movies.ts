import { asApi } from "zodios";
import { VideosAPI } from "./videos/api";

export const MovieAPI = asApi([
    ...VideosAPI,
] as const);