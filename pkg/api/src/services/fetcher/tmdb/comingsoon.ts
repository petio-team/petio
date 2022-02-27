import logger from "../../../app/logger";
import { SortByType } from "../../../tmdb/discover/types";
import { TMDBAPI } from "../../../tmdb/tmdb";
import {
  ComingSoonType,
  ComingSoon,
  Video,
} from "../../../models/comingsoon/model";
import onServer from "../../../plex/onServer";
import { Model } from "../../../models/comingsoon/db";
import { TV, TVResult } from "../../../tmdb/discover/tv/schema";
import { Movie, MovieResult } from "../../../tmdb/discover/movie/schema";
import dayjs from "dayjs";

export const buildComingSoon = async (maxPages: number): Promise<void> => {
  const queries = {
    sort_by: SortByType["popularity.desc"],
    with_original_language: "en",
  } as const;
  const now = dayjs().format("YYYY-MM-DD").toString();

  try {
    logger.verbose("getting the shows/movies", { label: "fetcher.tmdb" });
    const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
    const showsAndMovies = (await Promise.all(
      [...pages].map((page, _) =>
        Promise.all([
          TMDBAPI.get("/discover/tv", {
            queries: { ...queries, "first_air_date.gte": now, page },
          }),
          TMDBAPI.get("/discover/movie", {
            queries: { ...queries, "primary_release_date.gte": now, page },
          }),
        ])
      )
    )) as [TV, Movie][];

    logger.verbose("flattening the maps", { label: "fetcher.tmdb" });
    const shows = showsAndMovies.flatMap(([s]) => s.results);
    const movies = showsAndMovies.flatMap(([, m]) => m.results);

    logger.verbose("getting movie/show items", { label: "fetcher.tmdb" });
    const showsAndMoviesItems: ComingSoon[] = (await Promise.all([
      ...shows.map(buildShowItem),
      ...movies.map(buildMovieItem),
    ])) as ComingSoon[];

    logger.verbose("deleting enteries", { label: "fetcher.tmdb" });
    await Model.deleteMany({});

    logger.verbose("adding entries to the database", { label: "fetcher.tmdb" });
    await Model.insertMany(showsAndMoviesItems);
  } catch (e) {
    console.log(e);
  }

  return;
};

const buildShowItem = async (show: TVResult): Promise<ComingSoon> => {
  const plex = await onServer("show", false, false, show.id);
  return {
    type: ComingSoonType.Show,
    id: show.id,
    available: !!plex?.exists,
    title: show.name,
    posterPath: show.poster_path ?? "",
    date: !!show?.first_air_date
      ? dayjs().format(show.first_air_date).toString()
      : "",
    videos: await buildTVVideoItems(show.id),
  };
};

const buildMovieItem = async (movie: MovieResult): Promise<ComingSoon> => {
  const plex = await onServer("movie", false, false, movie.id);
  return {
    type: ComingSoonType.Movie,
    id: movie.id,
    available: !!plex?.exists,
    title: movie.title,
    posterPath: movie.poster_path ?? "",
    date: !!movie?.release_date
      ? dayjs().format(movie.release_date).toString()
      : "",
    videos: await buildMovieVideoItems(movie.id),
  };
};

const buildMovieVideoItems = async (id: number): Promise<Video[]> => {
  const { results } = await TMDBAPI.get("/movie/:id/videos", {
    params: {
      id,
    },
  });

  return results
    .filter(
      (video) =>
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser")
    )
    .map((video) => {
      return {
        title: video.name,
        key: video.key,
      };
    });
};

const buildTVVideoItems = async (id: number): Promise<Video[]> => {
  const { results } = await TMDBAPI.get("/tv/:id/videos", {
    params: {
      id,
    },
  });

  return results
    .filter(
      (video) =>
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser")
    )
    .map((video) => {
      return {
        title: video.name,
        key: video.key,
      };
    });
};
