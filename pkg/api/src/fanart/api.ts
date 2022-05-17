import { Zodios } from "zodios";
import { fanartApiKey } from "../app/env";
import { pluginApiKey } from "./key";
import * as z from "zod";

export enum FanartTypes {
  Movies = "movies",
  Shows = "tv",
}

export const FanartMovieSchema = z.object({
  name: z.string(),
  tmdb_id: z.string().optional(),
  imdb_id: z.string().optional(),
  hdmovielogo: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
  moviethumb: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
  movieposter: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
  moviebackground: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
  moviebanner: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
  moviedisc: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
        disc: z.string(),
        disc_type: z.string(),
      })
    )
    .optional(),
  hdmovieclearart: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
});
export type FanartMovie = z.infer<typeof FanartMovieSchema>;

export const FanartShowSchema = z.object({
  name: z.string(),
  thetvdb_id: z.string(),
  tvthumb: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        lang: z.string(),
        likes: z.string(),
      })
    )
    .optional(),
});
export type FanartShow = z.infer<typeof FanartShowSchema>;

export const FanartAPI = new Zodios("https://webservice.fanart.tv/v3", [
  {
    method: "get",
    path: "/:type/:id",
    parameters: [],
    response: z.union([FanartMovieSchema, FanartShowSchema]),
  },
] as const);

FanartAPI.use(
  pluginApiKey({
    getApiKey: async () => fanartApiKey,
  })
);
