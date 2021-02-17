// Config
const getConfig = require("../util/config");
const fanartLookup = require("../fanart");
const request = require("xhr-request");
const onServer = require("../plex/onServer");
const imdb = require("../meta/imdb");

const ISO6391 = require("iso-639-1");

const logger = require("../util/logger");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 86400 /*seconds*/,
});

async function showLookup(id, minified = false) {
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

    if (minified) {
      // Pre-fetch IMDB on minfied lookup but don't wait or return
      imdb(external.imdb_id);
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
        if (recommendations)
          Object.keys(recommendations.results).map((key) => {
            let recommendation = recommendations.results[key];
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
      } else {
        show.original_language_format = ISO6391.getName(show.original_language);
      }

      return show;
    } catch (err) {
      logger.log("warn", `Error processing show data - ${id}`);
      logger.log("warn", err);
      console.log(err);
      return { error: "not found" };
    }
  }
}

// Caching Layer

async function getShowData(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(id, function () {
      return tmdbData(id);
    });
  } catch (err) {
    logger.log("warn", `Error getting show data - ${id}`);
    logger.log("warn", err);
  }
  return data;
}

async function externalId(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`ext_${id}`, function () {
      return idLookup(id);
    });
  } catch (err) {
    logger.log("warn", `Error getting external ID - ${id}`);
    logger.log("warn", err);
  }
  return data;
}

async function getRecommendations(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`rec_${id}`, function () {
      return recommendationData(id);
    });
  } catch (err) {
    logger.log("warn", `Error getting recommendation data - ${id}`);
    logger.log("warn", err);
  }
  return data;
}

async function getReviews(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`rev_${id}`, function () {
      return reviewsData(id);
    });
  } catch (err) {
    logger.log("warn", `Error getting review data - ${id}`);
    logger.log("warn", err);
  }
  return data;
}

async function getSeasons(seasons, id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`seasons_${id}`, function () {
      return seasonsData(seasons, id);
    });
  } catch (err) {
    logger.log("warn", `Error getting season data - ${id}`);
    logger.log("warn", err);
  }
  return data;
}

// Lookup layer

async function tmdbData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}?api_key=${tmdbApikey}&append_to_response=credits,videos,keywords`;

  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }

        resolve(data);
      }
    );
  });
}

async function recommendationData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/recommendations?api_key=${tmdbApikey}&append_to_response=credits,videos,keywords`;

  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }

        resolve(data);
      }
    );
  });
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
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject();
        }

        resolve(data);
      }
    );
  });
}

async function reviewsData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/reviews?api_key=${tmdbApikey}`;

  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }

        resolve(data);
      }
    );
  });
}

function findEnLogo(logos) {
  let logoUrl = false;
  logos.forEach((logo) => {
    if (logo.lang === "en" && !logoUrl) {
      logoUrl = logo.url;
    }
  });
  return logoUrl;
}

function idLookup(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/external_ids?api_key=${tmdbApikey}`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
}

function discoverSeries(page = 1, params = {}) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let par = "";
  Object.keys(params).map((i) => {
    par += `&${i}=${params[i]}`;
  });
  let url = `${tmdb}discover/tv?api_key=${tmdbApikey}${par}&page=${page}`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }

        resolve(data);
      }
    );
  });
}

function network(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}network/${id}?api_key=${tmdbApikey}`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }

        resolve(data);
      }
    );
  });
}

module.exports = {
  discoverSeries,
  showLookup,
  network,
};
