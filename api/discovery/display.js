const Discovery = require("../models/discovery");
const logger = require("../util/logger");
const getConfig = require("../util/config");
const request = require("xhr-request");
const Movie = require("../tmdb/movie");
const Show = require("../tmdb/show");
const getHistory = require("../plex/history");

module.exports = async function getDiscovery(id, type = "movie") {
  if (!id) throw "No user";
  const discoveryPrefs = await Discovery.findOne({ id: id });
  if (!discoveryPrefs) throw "User not found in discovery";
  let movieGenres = discoveryPrefs.movie.genres;
  let genresSorted = [];
  for (var genre in movieGenres) {
    genresSorted.push(movieGenres[genre]);
  }
  genresSorted.sort(function (a, b) {
    if (a.count > b.count) {
      return -1;
    }
  });
  genresSorted.length = 3;
  let data = await Promise.all(
    genresSorted.map(async (genre) => {
      let id = genreID(genre.name, type);
      if (!id) return null;
      let args = {
        with_genres: id,
        sort_by: type === "movie" ? "revenue.desc" : "popularity.desc",
        "vote_count.gte": 500,
        certification_country: "US",
        "vote_average.lte": genre.highestRating - 0.5,
        "vote_average.gte": genre.lowestRating + 0.5,
      };
      let certifications = [];
      if (Object.keys(genre.cert).length > 0) {
        Object.keys(genre.cert).map((cert) => {
          // 10% threshold
          if (genre.count * 0.1 < genre.cert[cert]) {
            certifications.push(cert);
          }
        });
      }
      if (certifications.length > 0)
        args.certification = certifications.join("|");
      let discData =
        type === "movie"
          ? await discoverMovie(1, args)
          : await discoverShow(1, args);
      discData.results.sort(function (a, b) {
        if (a.vote_average > b.vote_average) {
          return -1;
        }
      });
      discData.results.map((result, i) => {
        if (result.id.toString() in discoveryPrefs.movie.history) {
          discData.results[i] = "watched";
        }
      });

      return {
        title: `${genre.name} ${
          type === "movie" ? "movies" : "shows"
        } you might like`,
        results: discData.results,
        genre_id: id,
        certifications: certifications,
        ratings: `${genre.lowestRating} - ${genre.highestRating}`,
      };
    })
  );
  let recentlyViewed = await getHistory(id, type);
  let recentData = await Promise.all(
    Object.keys(recentlyViewed)
      .slice(0, 5)
      .map(async (r) => {
        let recent = recentlyViewed[r];
        if (recent.id) {
          let related =
            type === "movie"
              ? await Movie.getRecommendations(recent.id)
              : await Show.getRecommendations(recent.id);
          if (related.results.length === 0) {
            console.log(recent);
            let showLookup = await Show.showLookup(recent.id);
            console.log(showLookup);
            if (!showLookup) return null;
            let params = {};
            if (showLookup.genres) {
              let genres = "";
              for (let i = 0; i < showLookup.genres.length; i++) {
                genres += `${showLookup.genres[i].id},`;
              }

              params.with_genres = genres;
            }
            recommendations = await discoverShow(1, params);
            if (recommendations.results.length === 0) return null;
            return {
              title: `Because you watched "${recent.name}"`,
              results: recommendations.results,
            };
          } else {
            return {
              title: `Because you watched "${recent.name}"`,
              results: related.results,
            };
          }
        }
      })
  );
  data = [...recentData, ...data];
  data = shuffle(data);
  return data;
};

function genreID(genreName, type) {
  // split types here
  if (type === "movie") {
    switch (genreName) {
      case "Adventure":
      case "Action/Adventure":
        return 12;
      case "Fantasy":
        return 14;
      case "Animation":
        return 16;
      case "Drama":
        return 18;
      case "Horror":
        return 27;
      case "Action":
        return 28;
      case "Comedy":
        return 35;
      case "History":
      case "Biography":
        return 36;
      case "Western":
        return 37;
      case "Thriller":
        return 53;
      case "Crime":
        return 80;
      case "Documentary":
      case "Factual":
        return 99;
      case "Science Fiction":
        return 878;
      case "Mystery":
        return 9648;
      case "Music":
        return 10402;
      case "War":
        return 10752;
      case "TV Movie":
        return 10770;
      case "Romance":
        return 10749;
      case "Family":
        return 10751;
      case "Action & Adventure":
        return 10759;
      case "Kids":
        return 10762;
      case "News":
        return 10763;
      case "Reality":
      case "Reality-TV":
        return 10764;
      case "Sci-Fi & Fantasy":
        return 10765;
      case "Soap":
        return 10766;
      case "Talk":
        return 10767;
      case "War & Politics":
        return 10768;
      default:
        logger.warn(`DISC: Genre not mapped ${genreName}`);
        return false;
    }
  } else {
    switch (genreName) {
      case "Adventure":
      case "Action/Adventure":
      case "Action":
      case "Action & Adventure":
        return 10759;
      case "Fantasy":
      case "Science Fiction":
      case "Sci-Fi":
      case "Sci-Fi & Fantasy":
        return 10765;
      case "Animation":
        return 16;
      case "Drama":
        return 18;
      case "Comedy":
        return 35;
      case "Western":
        return 37;
      case "Crime":
        return 80;
      case "Documentary":
      case "Factual":
        return 99;
      case "News":
        return 10763;
      case "Family":
        return 10751;
      case "Kids":
        return 10762;
      case "News":
        return 10763;
      case "Reality":
      case "Reality-TV":
        return 10764;
      case "Soap":
        return 10766;
      case "Talk":
        return 10767;
      case "War":
      case "War & Politics":
        return 10768;
      default:
        logger.warn(`DISC: Genre not mapped ${genreName}`);
        return false;
    }
  }
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

function discoverShow(page = 1, params = {}) {
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

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
