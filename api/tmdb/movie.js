// Config
const getConfig = require("../util/config");

const fanartLookup = require("../fanart");
const request = require("xhr-request");
const onServer = require("../plex/onServer");

const ISO6391 = require("iso-639-1");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({ store: "memory", max: 500, ttl: 86400 /*seconds*/ });

async function movieLookup(id, minified = false) {
  let fanart = minified ? false : await fanartLookup(id, "movies");
  let movie = false;
  try {
    data = await getMovieData(id);
    movie = Object.assign({}, data);
  } catch {
    return { error: "not found" };
  }
  if (movie) {
    if (fanart) {
      if (fanart.hdmovielogo) {
        movie.logo = findEnLogo(fanart.hdmovielogo);
      }
      if (fanart.moviethumb) {
        movie.tile = findEnLogo(fanart.moviethumb);
      }
    }
    let collectionData = false;
    let onPlex = await onServer("movie", movie.imdb_id, false, id);
    let recommendations = await getRecommendations(id);
    let recommendationsData = [];
    movie.on_server = onPlex.exists;
    movie.available_resolutions = onPlex.resolutions;
    if (recommendations.results) {
      Object.keys(recommendations.results).map((key) => {
        let recommendation = recommendations.results[key];
        recommendationsData.push(recommendation.id);
      });
    }
    if (!minified && movie.belongs_to_collection) {
      try {
        let collection = await getCollection(movie.belongs_to_collection.id);
        collectionData = [];
        collection.parts.map((part) => {
          collectionData.push(part.id);
        });
      } catch (err) {
        console.log(err);
        console.log(`Error getting collection data - ${movie.title}`);
      }
    }

    if (!minified) {
      try {
        let reviews = await getReviews(id);

        movie.reviews = reviews.results;
      } catch (err) {
        console.log(err);
      }
    }

    movie.recommendations = recommendationsData;
    movie.collection = collectionData;

    delete movie.production_countries;
    delete movie.budget;
    delete movie.adult;
    delete movie.original_title;
    // delete movie.production_companies;
    if (minified) {
      delete movie.credits;
      delete movie.backdrop_path;
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
      delete movie.videos;
      delete movie.vote_average;
      delete movie.vote_count;
    } else {
      movie.original_language_format = ISO6391.getName(movie.original_language);
    }
    if (!movie.id) {
      return { error: "no id returned" };
    }
    return movie;
  }
}

// Caching Layer

async function getMovieData(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(id, function () {
      return tmdbData(id);
    });
  } catch (err) {
    console.log(err);
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
    console.log(err);
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
    console.log(err);
  }
  return data;
}

async function getCollection(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`col_${id}`, function () {
      return collectionData(id);
    });
  } catch (err) {
    console.log(err);
  }
  return data;
}

// Lookup Layer

function tmdbData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}?api_key=${tmdbApikey}&append_to_response=credits,videos`;
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
        data.timestamp = new Date();
        resolve(data);
      }
    );
  });
}

async function recommendationData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}/recommendations?api_key=${tmdbApikey}&append_to_response=credits,videos`;

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

async function collectionData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}collection/${id}?api_key=${tmdbApikey}`;

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

async function reviewsData(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}movie/${id}/reviews?api_key=${tmdbApikey}`;

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

function discoverMovie(page = 1, params = {}) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let par = "";
  Object.keys(params).map((i) => {
    par += `&${i}=${params[i]}`;
  });
  let url = `${tmdb}discover/movie?api_key=${tmdbApikey}${par}&page=${page}`;
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

function company(id) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}company/${id}?api_key=${tmdbApikey}`;
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
  discoverMovie,
  movieLookup,
  company,
};
