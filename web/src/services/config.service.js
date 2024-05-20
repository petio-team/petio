import { del, get, post } from '../helpers';
import store from '../redux/store.js';

export function checkConfig() {
  return get('/config');
}

export async function saveConfig(config) {
  try {
    await post(`/setup/set/`, config);
  } catch (e) {
    console.log(e);
    throw 'Error saving your config';
  }
}

export async function updateConfig(config) {
  return post(`/config/update`, config);
}

export async function getConfig() {
  const data = await get(`/config/current`);
  if (!data) throw 'No data';
  updateStore({
    type: 'user/get-config',
    config: data,
  });
  return data;
}

export function getRadarr() {
  return get('/services/radarr/config');
}

export function deleteRadarr(uuid = '') {
  if (!uuid) return;
  return del(`/services/radarr/${uuid}`);
}

export function saveRadarrConfig(config) {
  if (!config) throw 'No config provided';

  return post(`/services/radarr/config`, config);
}

export async function testRadarr(id) {
  if (!id) throw 'No ID';
  return get(`/services/radarr/test/${id}`);
}

export async function getRadarrOptions(id) {
  try {
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
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export function getSonarr() {
  return get('/services/sonarr/config');
}

export function deleteSonarr(uuid = '') {
  if (!uuid) return;
  return del(`/services/sonarr/${uuid}`);
}

export function saveSonarrConfig(config) {
  if (!config) throw 'No config provided';

  return post(`/services/sonarr/config`, config);
}

export async function testSonarr(id) {
  if (!id) throw 'No ID';
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

// Notifications

export function saveEmailConfig(config) {
  return post(`/mail/create`, { email: config });
}

export function getEmailConfig() {
  return get(`/mail/config`);
}

export function testEmail() {
  return get(`/mail/test`);
}

export function testDiscord() {
  return get(`/hooks/discord/test`);
}

export function testTelegram() {
  return get(`/hooks/telegram/test`);
}

export function getHealth() {
  return get('/health');
}

function updateStore(data = {}) {
  if (Object.keys(data).length === 0) return false;
  return store.dispatch(data);
}
