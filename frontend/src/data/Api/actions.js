import { store } from "../store";
import * as types from "../actionTypes";
import * as api from "./api";

function finalise(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}

export async function getPopular() {
  let popular = await api.popular();

  if (popular) {
    popular.movies.forEach((result) => {
      let movie = {
        isMinified: true,
        id: result.id,
        title: result.title,
        release_date: result.release_date,
        on_server: result.on_server ? true : false,
        poster_path: result.poster_path,
      };
      finalise({
        type: types.MOVIE_LOOKUP,
        movie: movie,
        id: movie.id,
      });
    });

    popular.tv.forEach((result) => {
      let series = {
        isMinified: true,
        id: result.id,
        name: result.name,
        first_air_date: result.first_air_date,
        on_server: result.on_server ? true : false,
        poster_path: result.poster_path,
      };
      finalise({
        type: types.SERIES_LOOKUP,
        series: series,
        id: series.id,
      });
    });

    finalise({
      type: types.POPULAR,
      popular: {
        movies: popular.movies,
        tv: popular.tv,
        people: popular.people,
      },
    });
  }
}

export async function movie(id, minified = false) {
  let movie = await api.movie(id, minified);

  movie.isMinified = minified;

  finalise({
    type: types.MOVIE_LOOKUP,
    movie: movie,
    id: id,
  });
}

export async function series(id, minified = false) {
  let series = await api.series(id, minified);

  series.isMinified = minified;

  finalise({
    type: types.SERIES_LOOKUP,
    series: series,
    id: id,
  });
}

export async function person(id) {
  let data = await api.actor(id);

  let movies = data.movies;
  let shows = data.tv;
  let info = data.info;

  finalise({
    type: types.PERSON_LOOKUP,
    person: info,
    id: id,
  });

  if (movies.length === 0) {
    finalise({
      type: types.STORE_ACTOR_MOVIE,
      cast: {},
      crew: {},
      id: id,
    });
  } else {
    finalise({
      type: types.STORE_ACTOR_MOVIE,
      cast: movies.cast,
      crew: movies.crew,
      id: id,
    });
  }
  if (shows.length === 0) {
    finalise({
      type: types.STORE_ACTOR_SERIES,
      cast: {},
      crew: {},
      id: id,
    });
  } else {
    finalise({
      type: types.STORE_ACTOR_SERIES,
      cast: shows.cast,
      crew: shows.crew,
      id: id,
    });
  }
}

export async function search(term) {
  let searchResults = await api.search(term);

  return new Promise((resolve, reject) => {
    if (!searchResults) {
      reject();
    }
    searchResults.movies.forEach((result) => {
      let movie = {
        isMinified: true,
        id: result.id,
        title: result.title,
        release_date: result.release_date,
        on_server: result.on_server ? true : false,
        poster_path: result.poster_path,
      };
      finalise({
        type: types.MOVIE_LOOKUP,
        movie: movie,
        id: movie.id,
      });
    });

    searchResults.shows.forEach((result) => {
      let series = {
        isMinified: true,
        id: result.id,
        name: result.name,
        first_air_date: result.first_air_date,
        on_server: result.on_server ? true : false,
        poster_path: result.poster_path,
      };
      finalise({
        type: types.SERIES_LOOKUP,
        series: series,
        id: series.id,
      });
    });

    finalise({
      type: types.SEARCH,
      movies: searchResults.movies,
      series: searchResults.shows,
      people: searchResults.people,
    });

    resolve();
  });
}

export function clearSearch() {
  finalise({
    type: types.SEARCH,
    movies: [],
    series: [],
    people: [],
  });
}

export async function top(type) {
  try {
    let data = await api.top(type);
    Object.keys(data).map((key) => {
      let item = data[key];
      if (item.data) {
        let result = item.data;
        if (type === "movie") {
          let movie = {
            isMinified: true,
            id: result.id,
            title: result.title,
            release_date: result.release_date,
            on_server: result.on_server ? true : false,
            poster_path: result.poster_path,
          };
          finalise({
            type: types.MOVIE_LOOKUP,
            movie: movie,
            id: movie.id,
          });
        } else {
          let series = {
            isMinified: true,
            id: result.id,
            name: result.name,
            first_air_date: result.first_air_date,
            on_server: result.on_server ? true : false,
            poster_path: result.poster_path,
          };
          finalise({
            type: types.SERIES_LOOKUP,
            series: series,
            id: series.id,
          });
        }
      }
    });
    const sorted = Object.values(data)
      .sort((a, b) => a.globalViewCount - b.globalViewCount)
      .reverse();
    return sorted;
  } catch (err) {
    console.log(err);
    throw "Error getting plex movies";
  }
}

export async function history(user_id, type) {
  try {
    let data = await api.history(user_id, type);
    Object.keys(data).map((key) => {
      let result = data[key];
      if (type === "movie") {
        let movie = {
          isMinified: true,
          id: result.id,
          title: result.title,
          release_date: result.release_date,
          on_server: result.on_server ? true : false,
          poster_path: result.poster_path,
        };
        finalise({
          type: types.MOVIE_LOOKUP,
          movie: movie,
          id: movie.id,
        });
      } else {
        let series = {
          isMinified: true,
          id: result.id,
          name: result.name,
          first_air_date: result.first_air_date,
          on_server: result.on_server ? true : false,
          poster_path: result.poster_path,
        };
        finalise({
          type: types.SERIES_LOOKUP,
          series: series,
          id: series.id,
        });
      }
    });
    return data;
  } catch (err) {
    console.log(err);
    throw "Unable to get History";
  }
}

export async function discover(type, page, params) {
  return new Promise((resolve, reject) => {
    api
      .discover(type, page, params)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Error parsing discover");
      });
  });
}

export async function networkDetails(id) {
  return new Promise((resolve, reject) => {
    api
      .networkDetails(id)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Error getting network");
      });
  });
}

export async function companyDetails(id) {
  return new Promise((resolve, reject) => {
    api
      .companyDetails(id)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Error getting company");
      });
  });
}

export async function guideCalendar() {
  return new Promise((resolve, reject) => {
    api
      .guideCalendar()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Error getting network");
      });
  });
}

export let get_plex_media = (id, type) => {
  return new Promise((resolve, reject) => {
    api
      .get_plex_media(id, type)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export function checkConfig() {
  return new Promise((resolve, reject) => {
    api
      .checkConfig()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export async function discoveryMovies() {
  try {
    let data = await api.discoveryMovies();
    data.map((section) => {
      if (section && section.results && section.results.length > 0)
        section.results.map((result) => {
          let movie = {
            isMinified: true,
            id: result.id,
            title: result.title,
            release_date: result.release_date,
            on_server: result.on_server ? true : false,
            poster_path: result.poster_path,
          };
          finalise({
            type: types.MOVIE_LOOKUP,
            movie: movie,
            id: movie.id,
          });
        });
    });
    return data;
  } catch (err) {
    console.log(err);
    throw "Unable to get Discovery Movies";
  }
}

export async function discoveryShows() {
  try {
    let data = await api.discoveryShows();
    data.map((section) => {
      if (section && section.results && section.results.length > 0)
        section.results.map((result) => {
          let series = {
            isMinified: true,
            id: result.id,
            name: result.name,
            first_air_date: result.first_air_date,
            on_server: result.on_server ? true : false,
            poster_path: result.poster_path,
          };
          finalise({
            type: types.SERIES_LOOKUP,
            series: series,
            id: series.id,
          });
        });
    });
    return data;
  } catch (err) {
    console.log(err);
    throw "Unable to get Discovery Shows";
  }
}
