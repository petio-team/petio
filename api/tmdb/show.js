const http = require("http");
const agent = new http.Agent({ family: 4 });
const axios = require("axios");

// Config
const getConfig = require("../util/config");
const fanartLookup = require("../fanart");
const onServer = require("../plex/onServer");
const { lookup: imdb } = require("../meta/imdb");
const getLanguage = require("./languages");

const logger = require("../util/logger");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 86400 /*seconds*/,
});

async function showLookup(id, minified = false) {
  if (!id || id == "false") {
    return "No ID";
  }
  logger.log("verbose", `TMDB Show Lookup ${id}`);
  let external = await externalId(id);
  let show = false;
  try {
    data = await getShowData(id);
    show = Object.assign({}, data);
  } catch {
    return { error: "not found" };
  }
  if (show.success === false) {
    return { error: "not found" };
  }
  if (show) {
    if (!show.id) {
      return { error: "no id returned" };
    }

    try {
      let [
        imdb_data,
        fanart,
        recommendations,
        seasonsLookup,
        reviews,
        onPlex,
      ] = await Promise.all([
        !minified && external.imdb_id ? imdb(external.imdb_id) : false,
        minified ? false : fanartLookup(external.tvdb_id, "tv"),
        !minified ? getRecommendations(id) : false,
        !minified ? getSeasons(show.seasons, id) : false,
        !minified ? getReviews(id) : false,
        onServer("show", external.imdb_id, external.tvdb_id, id),
      ]);

      if (fanart) {
        if (fanart.hdtvlogo) {
          show.logo = findEnLogo(fanart.hdtvlogo);
        }
        if (fanart.tvthumb) {
          show.tile = findEnLogo(fanart.tvthumb);
        }
      }

      show.imdb_data = imdb_data;
      show.imdb_id = external.imdb_id;
      show.tvdb_id = external.tvdb_id;
      show.on_server = onPlex.exists;
      delete show.production_companies;
      delete show.homepage;
      delete show.languages;
      if (!minified) {
        show.server_seasons = onPlex.seasons;
        let seasons = Object.assign({}, seasonsLookup);
        let seasonData = {};
        let recommendationsData = [];
        Object.keys(seasons).map((key) => {
          let season = seasons[key];
          Object.keys(season.episodes).map((ep) => {
            delete season.episodes[ep].guest_stars;
            delete season.episodes[ep].crew;
            delete season.episodes[ep].production_code;
            delete season.episodes[ep].show_id;
          });
          seasonData[season.season_number] = season;
        });
        if (recommendations.results.length === 0) {
          let params = {};
          if (show.genres) {
            let genres = "";
            for (let i = 0; i < show.genres.length; i++) {
              genres += `${show.genres[i].id},`;
            }

            params.with_genres = genres;
          }
          recommendations = await discoverSeries(1, params);
        }
        if (recommendations)
          Object.keys(recommendations.results).map((key) => {
            let recommendation = recommendations.results[key];
            if (recommendation.id !== parseInt(id))
              recommendationsData.push(recommendation.id);
          });
        show.seasonData = seasonData;
        show.recommendations = recommendationsData;
        show.reviews = reviews.results;
      }

      if (minified) {
        delete show.created_by;
        delete show.credits;
        delete show.genres;
        delete show.in_production;
        delete show.last_air_date;
        delete show.next_episode_to_air;
        delete show.number_of_episodes;
        delete show.number_of_seasons;
        delete show.origin_country;
        delete show.original_name;
        delete show.overview;
        delete show.popularity;
        delete show.status;
        delete show.videos;
        delete show.vote_average;
        delete show.vote_count;
        delete show.seasons;
        delete show.age_rating;
        delete show.backdrop_path;
        delete show.episode_run_time;
        delete show.imdb_id;
        delete show.keywords;
        delete show.last_episode_to_air;
        delete show.networks;
        delete show.original_language;
        delete show.spoken_languages;
        delete show.tagline;
        delete show.type;
      } else {
        show.original_language_format = getLanguage(show.original_language);
      }

      return show;
    } catch (err) {
      logger.log("warn", `Error processing show data - ${id}`);
      logger.log({ level: "error", message: err });
      console.log(err);
      return { error: "not found" };
    }
  }
}

// Caching Layer

async function getShowData(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(id, async function () {
      return await tmdbData(id);
    });
  } catch (err) {
    logger.log("warn", `Error getting show data - ${id}`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

async function externalId(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`ext_${id}`, async function () {
      return await idLookup(id);
    });
  } catch (err) {
    logger.log("warn", `Error getting external ID - ${id}`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

async function getRecommendations(id, page = 1) {
  let data = false;
  try {
    data = await memoryCache.wrap(`rec_${id}__${page}`, async function () {
      return await recommendationData(id, page);
    });
  } catch (err) {
    logger.log("warn", `Error getting recommendation data - ${id}`);
    logger.log({ level: "error", message: err });
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
    logger.log("warn", `Error getting review data - ${id}`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

async function getSeasons(seasons, id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`seasons_${id}`, async function () {
      return await seasonsData(seasons, id);
    });
  } catch (err) {
    logger.log("warn", `Error getting season data - ${id}`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

// Lookup layer

async function tmdbData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}?api_key=${tmdbApikey}&append_to_response=aggregate_credits,videos,keywords,content_ratings,credits`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    let data = res.data;
    if (data.aggregate_credits) {
      if (data.aggregate_credits.cast.length > 50)
        data.aggregate_credits.cast.length = 50;
      data.credits.cast = [];
      data.aggregate_credits.cast.map((item, i) => {
        let character = item.roles.length > 0 ? item.roles[0].character : false;
        data.credits.cast[i] = {
          name: item.name,
          profile_path: item.profile_path,
          character: character,
          id: item.id,
        };
      });
      delete data.aggregate_credits;
    }
    if (data.content_ratings) {
      data.age_rating = findEnRating(data.content_ratings.results);
      delete data.content_ratings;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

async function recommendationData(id, page = 1) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/recommendations?api_key=${tmdbApikey}&page=${page}`;

  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function seasonsData(seasons, id) {
  let seasonList = [];
  Object.keys(seasons).map((key) => {
    seasonList.push(seasons[key].season_number);
  });
  return seasonsAsync(seasonList, id);
}

async function seasonsAsync(seasonList, id) {
  return Promise.all(seasonList.map((item) => getSeason(id, item)));
}

async function getSeason(id, season) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/season/${season}?api_key=${tmdbApikey}`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function reviewsData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/reviews?api_key=${tmdbApikey}`;

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
    if (logo.lang === "en" && !logoUrl) {
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
      rating = item.rating;
    }
  });
  return rating;
}

async function idLookup(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/external_ids?api_key=${tmdbApikey}`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    console.log(url);
    throw err;
  }
}

async function discoverSeries(page = 1, params = {}) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let par = "";
  Object.keys(params).map((i) => {
    par += `&${i}=${params[i]}`;
  });
  let url = `${tmdb}discover/tv?api_key=${tmdbApikey}${par}&page=${page}`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function network(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}network/${id}?api_key=${tmdbApikey}`;
  try {
    let res = await axios.get(url, { httpAgent: agent });
    return res.data;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  discoverSeries,
  showLookup,
  network,
  getRecommendations,
};
