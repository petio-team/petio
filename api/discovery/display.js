const Discovery = require("../models/discovery");
const logger = require("../util/logger");
const getConfig = require("../util/config");
const request = require("xhr-request");
const Movie = require("../tmdb/movie");
const Show = require("../tmdb/show");
const getHistory = require("../plex/history");
const onServer = require("../plex/onServer");

const cacheManager = require("cache-manager");
const getTop = require("../plex/top");
const memoryCache = cacheManager.caching({
  store: "memory",
  // max: 500,
  ttl: 3600 /*seconds*/,
});

module.exports = async function getDiscoveryData(id, type = "movie") {
  if (!id) throw "No user";
  const discoveryPrefs = await Discovery.findOne({ id: id });
  const popularData = await getTop(type === "movie" ? 1 : 2);
  let popular = [];
  for (p in popularData) {
    popular.push(popularData[p]);
  }
  if (!discoveryPrefs) throw "No user profile created";
  const watchHistory =
    type === "movie"
      ? discoveryPrefs.movie.history
      : discoveryPrefs.series.history;
  if (!discoveryPrefs) throw "User not found in discovery";
  let mediaGenres =
    type === "movie"
      ? discoveryPrefs.movie.genres
      : discoveryPrefs.series.genres;
  let mediaActors =
    type === "movie"
      ? discoveryPrefs.movie.people.cast
      : discoveryPrefs.series.people.cast;
  let mediaDirectors =
    type === "movie"
      ? discoveryPrefs.movie.people.director
      : discoveryPrefs.series.people.director;
  let genresSorted = [];
  let actorsSorted = [];
  let directorsSorted = [];
  for (var genre in mediaGenres) {
    genresSorted.push(mediaGenres[genre]);
  }
  genresSorted.sort(function (a, b) {
    if (a.count > b.count) {
      return -1;
    }
  });
  genresSorted.length = 4;
  let genreList = [];
  let genresData = await Promise.all(
    genresSorted.map(async (genre) => {
      let id = genreID(genre.name, type);
      if (!id || genreList.includes(id)) {
        return null;
      }
      genreList.push(id);
      let args = {
        with_genres: id,
        sort_by: type === "movie" ? "revenue.desc" : "popularity.desc",
        "vote_count.gte": 1500,
        certification_country: "US",
        "vote_average.gte":
          genre.lowestRating > 0.5
            ? genre.lowestRating - 0.5
            : genre.lowestRating,
      };
      if (type === "movie") {
        args["vote_average.lte"] =
          genre.highestRating < 9.5
            ? genre.highestRating + 0.5
            : genre.highestRating;
      }
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
          ? await Promise.all([discoverMovie(1, args), discoverMovie(2, args)])
          : await Promise.all([discoverShow(1, args), discoverShow(2, args)]);

      if (!discData[0].results) discData[0].results = [];
      if (!discData[1].results) discData[1].results = [];
      discData = {
        results: [...discData[0].results, ...discData[1].results],
      };

      discData.results.sort(function (a, b) {
        if (a.vote_count > b.vote_count) {
          return -1;
        }
      });

      let newDisc = [];
      discData.results.map(async (result, i) => {
        if (!watchHistory[result.id]) {
          let onPlex = await onServer(type, false, false, result.id);
          if (!onPlex) onPlex = { exists: false };
          discData.results[i].on_server = onPlex.exists;
          newDisc.push(discData.results[i]);
        }
      });

      return {
        title: `${genre.name} ${
          type === "movie" ? "movies" : "shows"
        } you might like`,
        results: newDisc,
        genre_id: id,
        certifications: certifications,
        ratings: `${genre.lowestRating} - ${genre.highestRating}`,
      };
    })
  );
  for (var actor in mediaActors) {
    actorsSorted.push({ name: actor, count: mediaActors[actor] });
  }
  actorsSorted.sort(function (a, b) {
    if (a.count > b.count) {
      return -1;
    }
  });
  if (actorsSorted.length > 4) actorsSorted.length = 4;
  let peopleData = await Promise.all(
    actorsSorted.map(async (actor) => {
      let lookup = await searchPeople(actor.name);
      if (lookup.results && lookup.results.length > 0) {
        let match = lookup.results[0];
        let args = {
          sort_by: type === "movie" ? "revenue.desc" : "popularity.desc",
          "vote_count.gte": 100,
          with_people: match.id,
        };
        let discData =
          type === "movie"
            ? await Promise.all([
                discoverMovie(1, args),
                discoverMovie(2, args),
              ])
            : await Promise.all([discoverShow(1, args), discoverShow(2, args)]);

        if (!discData[0].results) discData[0].results = [];
        if (!discData[1].results) discData[1].results = [];
        discData = {
          results: [...discData[0].results, ...discData[1].results],
        };

        discData.results.sort(function (a, b) {
          if (a.vote_average > b.vote_average) {
            return -1;
          }
        });

        let newDisc = await Promise.all(
          discData.results.map(async (result, i) => {
            if (!watchHistory[result.id]) {
              let onPlex = await onServer(type, false, false, result.id);
              result.on_server = onPlex.exists;
              return result;
            } else {
              return "watched";
            }
          })
        );

        return {
          title: `"${match.name}" ${type === "movie" ? "movies" : "shows"}`,
          results: newDisc,
        };
      }
    })
  );

  for (var director in mediaDirectors) {
    directorsSorted.push({ name: director, count: mediaDirectors[director] });
  }
  directorsSorted.sort(function (a, b) {
    if (a.count > b.count) {
      return -1;
    }
  });
  if (directorsSorted.length > 4) directorsSorted.length = 4;
  let directorData = await Promise.all(
    directorsSorted.map(async (director) => {
      let lookup = await searchPeople(director.name);
      if (lookup.results && lookup.results.length > 0) {
        let match = lookup.results[0];
        let args = {
          sort_by: type === "movie" ? "revenue.desc" : "popularity.desc",
          "vote_count.gte": 100,
          with_people: match.id,
        };
        let discData =
          type === "movie"
            ? await Promise.all([
                discoverMovie(1, args),
                discoverMovie(2, args),
              ])
            : await Promise.all([discoverShow(1, args), discoverShow(2, args)]);

        if (!discData[0].results) discData[0].results = [];
        if (!discData[1].results) discData[1].results = [];
        discData = {
          results: [...discData[0].results, ...discData[1].results],
        };

        discData.results.sort(function (a, b) {
          if (a.vote_average > b.vote_average) {
            return -1;
          }
        });

        let newDisc = await Promise.all(
          discData.results.map(async (result, i) => {
            if (!watchHistory[result.id]) {
              let onPlex = await onServer(type, false, false, result.id);
              result.on_server = onPlex.exists;
              return result;
            } else {
              return "watched";
            }
          })
        );

        return {
          title: `"${match.name}" ${type === "movie" ? "movies" : "shows"}`,
          results: newDisc,
        };
      }
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
              ? await Promise.all([
                  Movie.getRecommendations(recent.id, 1),
                  Movie.getRecommendations(recent.id, 2),
                ])
              : await Promise.all([
                  Show.getRecommendations(recent.id, 1),
                  Show.getRecommendations(recent.id, 2),
                ]);
          if (!related[0].results) related[0].results = [];
          if (!related[1].results) related[1].results = [];
          related = {
            results: [...related[0].results, ...related[1].results],
          };
          if (related.results.length === 0) {
            let lookup =
              type === "movie"
                ? await Movie.movieLookup(recent.id, true)
                : await Show.showLookup(recent.id, true);
            if (!lookup) return null;
            let params = {};
            if (lookup.genres) {
              let genres = "";
              for (let i = 0; i < lookup.genres.length; i++) {
                genres += `${lookup.genres[i].id},`;
              }

              params.with_genres = genres;
            }
            recommendations =
              type === "movie"
                ? await discoverMovie(1, params)
                : await discoverShow(1, params);
            if (recommendations.results.length === 0) return null;
            let newRelated = [];
            recommendations.results.map(async (result, i) => {
              if (!(result.id.toString() in watchHistory)) {
                let onPlex = await onServer(type, false, false, result.id);
                recommendations.results[i].on_server = onPlex.exists;
                newRelated.push(recommendations.results[i]);
              }
            });
            return {
              title: `Because you watched "${recent.title || recent.name}"`,
              results: recommendations.results,
            };
          } else {
            let newRelated = [];
            related.results.map(async (result, i) => {
              if (!(result.id.toString() in watchHistory)) {
                let onPlex = await onServer(type, false, false, result.id);
                related.results[i].on_server = onPlex.exists;
                newRelated.push(related.results[i]);
              }
            });
            return {
              title: `Because you watched "${recent.title || recent.name}"`,
              results: newRelated,
            };
          }
        }
      })
  );
  let now = new Date().toISOString().split("T")[0];
  let upcoming =
    type === "movie"
      ? await discoverMovie(1, {
          sort_by: "popularity.desc",
          "primary_release_date.gte": now,
        })
      : await discoverShow(1, {
          sort_by: "popularity.desc",
          "first_air_date.gte": now,
        });
  let data = [...peopleData, ...directorData, ...recentData, ...genresData];
  data = shuffle(data);
  return [
    {
      title:
        type === "movie" ? "Popular Movies on Plex" : "Popular Shows on Plex",
      results: popular,
    },
    {
      title: type === "movie" ? "Movies coming soon" : "Shows coming soon",
      results: upcoming.results,
    },
    ...data,
  ];
};

function genreID(genreName, type) {
  if (type === "movie") {
    switch (genreName) {
      case "Action":
        return 28;
      case "Adventure":
      case "Action/Adventure":
        return 12;
      case "Animation":
        return 16;
      case "Comedy":
        return 35;
      case "Crime":
      case "Film-Noir":
        return 80;
      case "Documentary":
      case "Factual":
        return 99;
      case "Drama":
        return 18;
      case "Family":
      case "Kids":
      case "Children":
        return 10751;
      case "Fantasy":
        return 14;
      case "History":
      case "Biography":
        return 36;
      case "Horror":
        return 27;
      case "Music":
      case "Musical":
        return 10402;
      case "Mystery":
        return 9648;
      case "Romance":
        return 10749;
      case "Science Fiction":
      case "Sci-Fi":
        return 878;
      case "TV Movie":
        return 10770;
      case "Thriller":
        return 53;
      case "War":
        return 10752;
      case "Western":
        return 37;

      default:
        logger.warn(`DISC: Genre not mapped ${genreName}`);
        return false;
    }
  } else {
    switch (genreName) {
      case "Action & Adventure":
      case "Adventure":
      case "Action/Adventure":
      case "Action":
        return 10759;
      case "Animation":
        return 16;
      case "Comedy":
        return 35;
      case "Crime":
        return 80;
      case "Documentary":
      case "Factual":
      case "Biography":
        return 99;
      case "Drama":
        return 18;
      case "Family":
        return 10751;
      case "Kids":
      case "Children":
        return 10762;
      case "Mystery":
      case "Horror":
      case "Thriller":
      case "Suspense":
        return 9648;
      case "News":
        return 10763;
      case "Reality":
      case "Reality-TV":
        return 10764;
      case "Sci-Fi & Fantasy":
      case "Science Fiction":
      case "Fantasy":
      case "Sci-Fi":
        return 10765;
      case "Soap":
        return 10766;
      case "Talk":
        return 10767;
      case "War":
      case "War & Politics":
        return 10768;
      case "Western":
        return 37;
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

function searchPeople(term) {
  const config = getConfig();
  const tmdbApikey = config.tmdbApi;
  const tmdb = "https://api.themoviedb.org/3/";
  let url = `${tmdb}search/person?query=${term}&include_adult=false&api_key=${tmdbApikey}`;
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
