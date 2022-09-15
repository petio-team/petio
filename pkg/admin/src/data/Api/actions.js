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
    popular.movies.forEach((movie) => {
      movie.isMinified = true;
      finalise({
        type: types.MOVIE_LOOKUP,
        movie: movie,
        id: movie.id,
      });
    });

    popular.tv.forEach((series) => {
      series.isMinified = true;
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

  if (!series.id) {
    throw "Unable to get series info";
  }

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
    searchResults.movies.forEach((movie) => {
      movie.isMinified = true;
      finalise({
        type: types.MOVIE_LOOKUP,
        movie: movie,
        id: movie.id,
      });
    });

    searchResults.shows.forEach((series) => {
      // console.log(series);
      series.isMinified = true;
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

export let top = (type) => {
  return new Promise((resolve, reject) => {
    api
      .top(type)
      .then((data) => {
        const sorted = Object.values(data)
          .sort((a, b) => a.globalViewCount - b.globalViewCount)
          .reverse();

        resolve(sorted);
      })
      .catch((err) => {
        console.log(err);
        reject("Error getting plex movies");
      });
  });
};

export async function history(user_id, type) {
  return new Promise((resolve, reject) => {
    api
      .history(user_id, type)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject("Error getting plex movies");
      });
  });
}

export let get_plex_media = (id, type) => {
  return new Promise((resolve, reject) => {
    api
      .get_plex_media(id, type)
      .then((res) => {
        resolve(res);

        if (type === "movie") {
          finalise({
            type: types.MOVIE_LOOKUP,
            movie: movie,
            id: movie.id,
          });
        } else {
          finalise({
            type: types.SERIES_LOOKUP,
            movie: series,
            id: series.id,
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export let bandwidth = () => {
  return new Promise((resolve, reject) => {
    api
      .getBandwidth()
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export let serverInfo = () => {
  return new Promise((resolve, reject) => {
    api
      .getServerInfo()
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export let currentSessions = () => {
  return new Promise((resolve, reject) => {
    api
      .getCurrentSessions()
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export async function checkConfig() {
  return api.checkConfig();
}

export async function saveConfig(config) {
  return api.saveConfig(config);
}

export async function updateConfig(config) {
  return api.updateConfig(config);
}

export async function sonarrConfig({
  withPaths = false,
  withProfiles = false,
  withLanguages = false,
  withAvailabilities = false,
  withTags = false,
}) {
  return api.sonarrConfig({
    withPaths,
    withProfiles,
    withLanguages,
    withAvailabilities,
    withTags,
  });
}

export async function sonarrDeleteInstance(uuid) {
  return api.deleteSonarrInstance(uuid);
}

export async function sonarrOptions(id) {
  return api.getSonarrOptions(id);
}

export async function radarrConfig({
  withPaths = false,
  withProfiles = false,
  withLanguages = false,
  withAvailabilities = false,
  withTags = false,
}) {
  return api.radarrConfig({
    withPaths,
    withProfiles,
    withLanguages,
    withAvailabilities,
    withTags,
  });
}

export async function radarrDeleteInstance(uuid) {
  return api.deleteRadarrInstance(uuid);
}

export async function radarrOptions(id) {
  return api.getRadarrOptions(id);
}

export async function saveSonarrConfig(config) {
  return api.saveSonarrConfig([...config]);
}

export function testSonarr(id) {
  return new Promise((resolve, reject) => {
    api
      .testSonarr(id)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export function testRadarr(id) {
  return new Promise((resolve, reject) => {
    api
      .testRadarr(id)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export async function saveRadarrConfig(config) {
  return api.saveRadarrConfig([...config]);
}

export function saveEmailConfig(config) {
  return new Promise((resolve, reject) => {
    api
      .saveEmailConfig(config)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export function getEmailConfig() {
  return new Promise((resolve, reject) => {
    api
      .getEmailConfig()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export function getConfig() {
  return new Promise((resolve, reject) => {
    api
      .getConfig()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export function testEmail() {
  return new Promise((resolve, reject) => {
    api
      .testEmail()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export function testDiscord() {
  return new Promise((resolve, reject) => {
    api
      .testDiscord()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export function testTelegram() {
  return new Promise((resolve, reject) => {
    api
      .testTelegram()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export async function getUser(id) {
  try {
    let userData = await api.getUser(id);
    finalise({
      type: types.GET_USER,
      user: userData,
      id: userData.id,
    });
  } catch (err) {
    finalise({
      type: types.GET_USER,
      user: {
        email: "User Not Found",
        recommendationsPlaylistId: false,
        thumb: false,
        title: "User Not Found",
        username: "User Not Found",
        __v: false,
        id: false,
      },
      id: id,
    });
  }
}

export async function allUsers() {
  try {
    let userData = await api.allUsers();
    let data = {};
    userData.map((user, i) => {
      if (user) {
        data[user.id] = user;
      } else {
        console.log(`User ${i} didn't return any data, this is unusual`);
      }
    });
    finalise({
      type: types.ALL_USERS,
      users: data,
    });
  } catch (err) {
    console.log(err);
  }
}

export async function testMongo(mongo) {
  try {
    let result = await api.testMongo(mongo);
    return result.status;
  } catch (err) {
    console.log(err);
    return "failed";
  }
}

export function getIssues() {
  return new Promise((resolve, reject) => {
    api
      .getIssues()
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

export async function createUser(user) {
  try {
    let result = await api.createUser(user);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getProfiles() {
  try {
    let result = await api.getProfiles();
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function saveProfile(profile) {
  try {
    let result = await api.saveProfile(profile);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function deleteProfile(profile) {
  try {
    let result = await api.deleteProfile(profile);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function editUser(user) {
  try {
    let result = await api.editUser(user);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function deleteUser(user) {
  try {
    let result = await api.deleteUser(user);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function bulkEditUser(data) {
  try {
    let result = await api.bulkEditUser(data);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function removeRequest(request, reason) {
  try {
    await api.removeReq(request, reason);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function updateRequest(request, servers) {
  try {
    await api.updateReq(request, servers);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getConsole() {
  try {
    let data = await api.getConsole();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getReviews() {
  try {
    let data = await api.getReviews();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function removeIssue(id, message) {
  try {
    await api.removeIssue(id, message);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function updateFilters(movies, tv) {
  try {
    await api.updateFilters(movies, tv);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getFilters() {
  try {
    let data = await api.getFilters();
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function uploadThumb(post, id) {
  try {
    let data = await api.uploadThumb(post, id);
    return data;
  } catch (err) {
    if (err.message === "API returned status code 413") {
      throw "File Exceeds Upload Limit!";
    } else {
      throw "Failed to Upload Thumb";
    }
  }
}

export async function testPlex() {
  try {
    let data = await api.testPlex();
    return data;
  } catch (err) {
    console.log(err);
    throw "Unable to test, please try again later";
  }
}
