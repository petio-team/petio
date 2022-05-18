import { asApi } from "zodios";
import { VideosAPI } from "./videos/api";
import { MovieDetailsAPI } from "./details/api";

export const MovieAPI = asApi([...MovieDetailsAPI, ...VideosAPI] as const);
