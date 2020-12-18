// Config
const getConfig = require("../util/config");

const fanartLookup = require("../fanart");
const request = require("xhr-request");
const onServer = require("../plex/onServer");

async function movieLookup(id, minified = false) {
  let fanart = minified ? false : await fanartLookup(id, "movies");
  let movie = false;
  try {
    movie = await getMovieData(id);
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
      console.log("running");
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
    delete movie.original_language;
    delete movie.original_title;
    delete movie.production_companies;
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
    }
    if (!movie.id) {
      return { error: "no id returned" };
    }
    return movie;
  }
}

async function getMovieData(id) {
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
        // console.log(data);
        resolve(data);
      }
    );
  });
}

async function getRecommendations(id) {
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

async function getCollection(id) {
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

async function getReviews(id) {
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

module.exports = movieLookup;
