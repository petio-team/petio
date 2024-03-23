import { get, post, put, upload } from "../http";

export async function popular() {
  return get("/trending");
}

export async function top(type) {
  return get(type === "movie" ? "/top/movies" : "/top/shows");
}

export async function history(user_id, type) {
  return post("/history", { id: user_id, type });
}

export async function getBandwidth() {
  return get("/history/bandwidth");
}

export async function getServerInfo() {
  return get("/history/server");
}

export async function getCurrentSessions() {
  return get("/sessions");
}

export async function get_plex_media(id, type) {
  return get(`/plex/lookup/${type}/${id}`);
}

export async function movie(id = false, minified) {
  if (!id) return Promise.resolve(false);
  return get(`/movie/lookup/${id}${minified ? "/minified" : ""}`);
}

export async function series(id = false, minified) {
  if (!id) return Promise.resolve(false);
  return get(`/show/lookup/${id}${minified ? "/minified" : ""}`);
}

export async function person(id = false) {
  if (!id) return Promise.resolve(false);
  return get(`/person/lookup/${id}`);
}

export async function search(title = false) {
  return get(`/search/${encodeURIComponent(title)}`);
}

export async function actor(id = false) {
  if (!id) return Promise.resolve(false);
  return get(`/person/lookup/${id}`);
}

export async function checkConfig() {
  return get("/config");
}

export async function saveConfig(config) {
  return post(`/setup/set`, config);
}

export async function updateConfig(config) {
  return post(`/config/update`, config);
}

export async function sonarrConfig() {
  return get(`/services/sonarr/config`);
}

export async function saveSonarrConfig(config) {
  return post(`/services/sonarr/config`, config);
}

export async function testSonarr(id) {
  return get(`/services/sonarr/test/${id}`);
}

export async function sonarrPaths(id) {
  return get(`/services/sonarr/paths/${id}`);
}

export async function sonarrProfiles(id) {
  return get(`/services/sonarr/profiles/${id}`);
}

export async function sonarrTags(id) {
  return get(`/services/sonarr/tags/${id}`);
}

export async function radarrConfig() {
  return get(`/services/radarr/config`);
}

export async function radarrPaths(id) {
  return get(`/services/radarr/paths/${id}`);
}

export async function radarrProfiles(id) {
  return get(`/services/radarr/profiles/${id}`);
}

export async function radarrTags(id) {
  return get(`/services/radarr/tags/${id}`);
}

export async function testRadarr(id) {
  return get(`/services/radarr/test/${id}`);
}

export function saveRadarrConfig(config) {
  return post(`/services/radarr/config`, config);
}

export function saveEmailConfig(config) {
  return post(`/mail/create`, { email: config });
}

export function getEmailConfig() {
  return get(`/mail/config`);
}

export function getConfig() {
  return get(`/config/current`);
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

export async function getUser(id) {
  return get(`/user/${id}`);
}

export async function allUsers() {
  return get(`/user/all`);
}

export function testServer(server) {
  return post(`/setup/test_server`, { server });
}

export function testMongo(mongo) {
  return post(`/setup/test_mongo`, { mongo });
}

export function getIssues() {
  return get(`/issue/all`);
}

export function createUser(user) {
  return post(`/user/create_custom`, { user });
}

export function getProfiles() {
  return get(`/profiles/all`);
}

export function saveProfile(profile) {
  return post(`/profiles/save_profile`, { profile });
}

export function deleteProfile(profile) {
  return post(`/profiles/delete_profile`, { profile });
}

export function editUser(user) {
  return post(`/user/edit`, { user });
}

export function deleteUser(user) {
  return post(`/user/delete_user`, { user });
}

export function bulkEditUser(data) {
  return post(`/user/bulk_edit`, data);
}

export function removeReq(request, reason) {
  return post(`/request/remove`, { request, reason });
}

export function updateReq(request, servers) {
  return post(`/request/update`, { request, servers });
}

export function getConsole() {
  return get(`/logs/stream`);
}

export function getReviews() {
  return get(`/review/all`);
}

export function removeIssue(id, message) {
  return post(`/issue/remove`, { id, message });
}

export function updateFilters(movie, tv) {
  return post(`/filter/update`, { movie, tv });
}

export function getFilters() {
  return get(`/filter`);
}

export function uploadThumb(data, id) {
  return upload(`/user/thumb/${id}`, data);
}

export function testPlex() {
  return get(`/plex/test_plex`);
}

export function updatePlexToken() {
  return get(`/plex/update_token`);
}

export async function getPlexLibraries() {
  return get(`/invitations/libraries`);
}

export async function getInvitations() {
  return get(`/invitations`);
}

export async function getInvitation(id) {
  return post(`/invitations`, id);
}

export async function addInvitation(invitation) {
  return put(`/invitations`, invitation);
}

export async function deleteInvitation(id) {
  return post(`/invitations/delete`, { id });
}

export async function updateInvitation(invitation) {
  return post(`/invitations`, invitation);
}

export async function modifyRedirectUrl(redirectUrl) {
  return post(`/redirectUrl`, { redirectUrl }, "handle");
}

export async function acceptInvitation(acceptedBy, invitCode) {
  return post(`/invitations/accept`, { acceptedBy, invitCode });
}
