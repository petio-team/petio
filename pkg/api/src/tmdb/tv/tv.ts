import { asApi } from "zodios";
import { VideosAPI } from "./videos/api";
import { TvDetailsAPI } from "./details/api";

export const TVAPI = asApi([...TvDetailsAPI, ...VideosAPI] as const);
