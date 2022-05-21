import http from "http";
import axios from "axios";
import cacheManager from "cache-manager";

import fanartLookup from "../fanart";
import onServer from "../plex/server";
import { lookup } from "../meta/imdb";
import getLanguage from "./languages";
import logger from "@/loaders/logger";
import { tmdbApiKey } from "../app/env";

const agent = new http.Agent({ family: 4 });
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 86400 /*seconds*/,
});

export async function movieLookup(id, minified = false) {
  logger.verbose(`TMDB Movie Lookup ${id}`, { label: "tmdb.movie" });
  if (!id || id == "false") {
    return "No ID";
  }
  let fanart: any = minified ? false : await fanartLookup(id, "movies");
  let movie: any = false;
  let data: any;
  try {
    data = await getMovieData(id);
    movie = Object.assign({}, data);
  } catch {
    return { error: "unable to get movie data" };
  }
  if (movie.success === false) {
    return { error: "movie was invalid" };
  }
  if (movie) {
    if (!movie.id) {
      return { error: "no id returned" };
    }
    if (fanart) {
      if (fanart.hdmovielogo) {
        movie.logo = findEnLogo(fanart.hdmovielogo);
      }
      if (fanart.moviethumb) {
        movie.tile = findEnLogo(fanart.moviethumb);
      }
    }
    try {
      let collectionData: any = false;
      let [
        onPlex,
        recommendations,
        similar,
        imdb_data,
        collection,
        reviews,
      ]: any = await Promise.all([
        onServer("movie", movie.imdb_id, false, id),
        getRecommendations(id),
        getSimilar(id),
        !minified && movie.imdb_id ? lookup(movie.imdb_id) : false,
        !minified && movie.belongs_to_collection
          ? getCollection(movie.belongs_to_collection.id)
          : false,
        !minified ? getReviews(id) : false,
      ]);

      let recommendationsData: any = [];
      movie.on_server = onPlex.exists;
      movie.available_resolutions = onPlex.resolutions;
      movie.imdb_data = imdb_data;
      movie.reviews = reviews.results;
      if (!minified) {
        if (
          recommendations.results.length === 0 &&
          similar.results.length === 0
        ) {
          let params: any = {};
          if (movie.genres) {
            let genres = "";
            for (let i = 0; i < movie.genres.length; i++) {
              genres += `${movie.genres[i].id},`;
            }

            params.with_genres = genres;
          }
          recommendations = await discoverMovie(1, params);
        }
      }
      if (recommendations)
        Object.keys(recommendations.results).map((key) => {
          let recommendation = recommendations.results[key];
          if (recommendation.id !== parseInt(id))
            recommendationsData.push(recommendation.id);
        });
      if (similar)
        Object.keys(similar.results).map((key) => {
          let recommendation = similar.results[key];
          if (
            recommendation.id !== parseInt(id) &&
            !recommendationsData.includes(recommendation.id)
          )
            recommendationsData.push(recommendation.id);
        });
      if (!minified && movie.belongs_to_collection) {
        collectionData = [];
        collection.parts.map((part) => {
          collectionData.push(part.id);
        });
      }

      movie.recommendations = recommendationsData;
      movie.collection = collectionData;
      movie.keywords = movie.keywords.keywords;
      movie.videos = {
        results: [
          ...movie.videos.results.filter(
            (obj) => obj.type == "Trailer" && obj.site == "YouTube"
          ),
          ...movie.videos.results.filter(
            (obj) => obj.type == "Teaser" && obj.site == "YouTube"
          ),
        ],
      };
      delete movie.production_countries;
      delete movie.adult;
      delete movie.original_title;
      if (minified) {
        delete movie.credits;
        delete movie.belongs_to_collection;
        delete movie.genres;
        delete movie.homepage;
        delete movie.popularity;
        delete movie.recommendations;
        delete movie.revenue;
        delete movie.runtime;
        delete movie.spoken_languages;
        delete movie.status;
        delete movie.tagline;
        delete movie.vote_average;
        delete movie.vote_count;
        delete movie.adult;
        delete movie.genre_ids;
        delete movie.original_language;
        delete movie.overview;
      } else {
        movie.original_language_format = getLanguage(movie.original_language);
      }

      return movie;
    } catch (err) {
      logger.warn(`Error processing movie data - ${id}`, {
        label: "tmdb.movie",
      });
      logger.error(err, { label: "tmdb.movie" });
      return { error: "not found" };
    }
  }
}

async function getMovieData(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(id, async function () {
      return await tmdbData(id);
    });
  } catch (err) {
    logger.warn(`Error getting movie data - ${id}`, { label: "tmdb.movie" });
    logger.error(err, { label: "tmdb.movie" });
  }
  return data;
}

export async function getRecommendations(id, page = 1) {
  let data = false;
  try {
    data = await memoryCache.wrap(`rec_${id}_${page}`, async function () {
      return await recommendationData(id, page);
    });
  } catch (err) {
    logger.warn(`Error getting movie recommendations - ${id}`, {
      label: "tmdb.movie",
    });
    logger.error(err, { label: "tmdb.movie" });
  }
  return data;
}

export async function getSimilar(id, page = 1) {
  let data = false;
  try {
    data = await memoryCache.wrap(`similar_${id}_${page}`, async function () {
      return await similarData(id, page);
    });
  } catch (err) {
    logger.warn(`Error getting movie recommendations - ${id}`, {
      label: "tmdb.movie",
    });
    logger.error(err, { label: "tmdb.movie" });
  }
  return data;
}

async function getReviews(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`rev_${id}`, async function () {
      return await reviewsData(id);
    });
  } catch (err) {
    logger.warn(`Error getting movie reviews - ${id}`, { label: "tmdb.movie" });
    logger.log(err, { label: "tmdb.movie" });
  }
  return data;
}

async function getCollection(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`col_${id}`, async function () {
      return await collectionData(id);
    });
  } catch (err) {
    logger.warn(`Error getting movie collections - ${id}`, {
      label: "tmdb.movie",
    });
    logger.error(err, { label: "tmdb.movie" });
  }
  return data;
}

// Lookup Layer

async function tmdbData(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}?api_key=${tmdbApiKey}&append_to_response=credits,videos,keywords,release_dates`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    let data = res.data;
    data.timestamp = new Date();
    if (data.release_dates) {
      data.age_rating = findEnRating(data.release_dates.results);
      delete data.release_dates;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

async function recommendationData(id, page = 1) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}/recommendations?api_key=${tmdbApiKey}&page=${page}&append_to_response=videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function similarData(id, page = 1) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}/similar?api_key=${tmdbApiKey}&page=${page}&append_to_response=videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function collectionData(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}collection/${id}?api_key=${tmdbApiKey}&append_to_response=videos`;

  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function reviewsData(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}/reviews?api_key=${tmdbApiKey}`;

  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

// Lets i18n this soon
function findEnLogo(logos) {
  let logoUrl = false;
  logos.forEach((logo) => {
    // For some reason fanart defaults to this obscure logo sometimes so lets exclude it
    if (
      logo.lang === "en" &&
      !logoUrl &&
      logo.url !==
        "https://assets.fanart.tv/fanart/tv/0/hdtvlogo/-60a02798b7eea.png" &&
      logo.url !==
        "http://assets.fanart.tv/fanart/tv/0/hdtvlogo/-60a02798b7eea.png"
    ) {
      logoUrl = logo.url;
    }
  });

  return logoUrl;
}

// Lets i18n this soon
function findEnRating(data) {
  let rating = false;
  data.forEach((item) => {
    if (item.iso_3166_1 === "US") {
      rating = item.release_dates[0].certification;
    }
  });
  return rating;
}

export async function discoverMovie(page = 1, params = {}) {
  const tmdb = "https://api.themoviedb.org/3/";
  let par = "";
  Object.keys(params).map((i) => {
    par += `&${i}=${params[i]}`;
  });
  let url = `${tmdb}discover/movie?api_key=${tmdbApiKey}${par}&page=${page}&append_to_response=videos`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    if (res.data && res.data.results.length > 0) {
      await Promise.all(
        res.data.results.map(async (movie) => {
          const check: any = await onServer("movie", false, false, movie.id);
          movie.on_server = check.exists;
        })
      );
    }
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function company(id) {
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}company/${id}?api_key=${tmdbApiKey}`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}
