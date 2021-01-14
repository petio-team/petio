// Config
const getConfig = require("../util/config");
const fanartLookup = require("../fanart");
const request = require("xhr-request");
const onServer = require("../plex/onServer");

async function showLookup(id, minified = false) {
  let external = await externalId(id);
  let fanart = minified ? false : await fanartLookup(external.tvdb_id, "tv");
  let show = false;
  try {
    show = await getShowData(id);
  } catch {
    return { error: "not found" };
  }
  if (show) {
    if (fanart) {
      if (fanart.hdtvlogo) {
        show.logo = findEnLogo(fanart.hdtvlogo);
      }
      if (fanart.tvthumb) {
        show.tile = findEnLogo(fanart.tvthumb);
      }
    }
    show.imdb_id = external.imdb_id;
    show.tvdb_id = external.tvdb_id;
    delete show.production_companies;
    delete show.homepage;
    delete show.languages;
    if (!minified) {
      let recommendations = await getRecommendations(id);
      let seasons = await getSeasons(show.seasons, id);
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
      Object.keys(recommendations.results).map((key) => {
        let recommendation = recommendations.results[key];
        recommendationsData.push(recommendation.id);
      });
      show.seasonData = seasonData;
      show.recommendations = recommendationsData;
    }

    if (!minified) {
      try {
        let reviews = await getReviews(id);

        show.reviews = reviews.results;
      } catch (err) {
        console.log(err);
      }
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
      // delete show.original_language;
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
    let onPlex = await onServer("show", show.imdb_id, show.tvdb_id, id);
    show.on_server = onPlex.exists;
    if (!show.id) {
      return { error: "no id returned" };
    }
    return show;
  }
}

async function getShowData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}?api_key=${tmdbApikey}&append_to_response=credits,videos`;

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

async function getRecommendations(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}tv/${id}/recommendations?api_key=${tmdbApikey}&append_to_response=credits,videos`;

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

async function getSeasons(seasons, id) {
  let seasonList = [];
  Object.keys(seasons).map((key) => {
    // if (key > 0) {
    seasonList.push(seasons[key].season_number);
    // }
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

async function getReviews(id) {
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

function externalId(id) {
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

module.exports = showLookup;
