import { get, post } from "../helpers";
import store from "../redux/store.js";

export function checkConfig() {
  return get("/config");
}

export async function saveConfig(config) {
  try {
    await post(`/setup/set`, config);
  } catch (e) {
    console.log(e);
    throw "Error saving your config";
  }
}

export async function testMongo(mongo) {
  try {
    let result = await post(`/setup/test_mongo`, { mongo });
    return result.status;
  } catch (err) {
    console.log(err);
    return "failed";
  }
}

export async function updateConfig(config) {
  return post(`/config/update`, config);
}

export async function getConfig() {
  const data = await get(`/config/current`);
  if (!data) throw "No data";
  updateStore({
    type: "user/get-config",
    config: data,
  });
  return data;
}

export function getRadarr() {
  return get("/services/radarr/config");
}

export function saveRadarrConfig(config) {
  if (!config) throw "No config provided";

  return post(`/services/radarr/config`, { data: JSON.stringify(config) });
}

export async function testRadarr(id) {
  if (!id) throw "No ID";
  return get(`/services/radarr/test/${id}`);
}

export async function getRadarrOptions(id) {
  let [paths, profiles, tags, languages] = await Promise.all([
    get(`/services/radarr/paths/${id}`),
    get(`/services/radarr/profiles/${id}`),
    get(`/services/radarr/tags/${id}`),
    get(`/services/radarr/languages/${id}`),
  ]);

  return {
    paths,
    profiles,
    tags,
    languages,
  };
}

export function getSonarr() {
  return get("/services/sonarr/config");
}

export function saveSonarrConfig(config) {
  if (!config) throw "No config provided";

  return post(`/services/sonarr/config`, { data: JSON.stringify(config) });
}

export async function testSonarr(id) {
  if (!id) throw "No ID";
  return get(`/services/sonarr/test/${id}`);
}

export async function getSonarrOptions(id) {
  let [paths, profiles, tags, languages] = await Promise.all([
    get(`/services/sonarr/paths/${id}`),
    get(`/services/sonarr/profiles/${id}`),
    get(`/services/sonarr/tags/${id}`),
    get(`/services/sonarr/languages/${id}`),
  ]);

  return {
    paths,
    profiles,
    tags,
    languages,
  };
}

export function updateFilters(movie, tv) {
  return post(`/filter/update`, { movie, tv });
}

export function getFilters() {
  return get(`/filter`);
}

function updateStore(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}
