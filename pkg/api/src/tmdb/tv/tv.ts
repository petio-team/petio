import { asApi } from "zodios";
import { VideosAPI } from "./videos/api";

export const TVAPI = asApi([...VideosAPI] as const);
