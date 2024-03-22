import { get, post } from "../http";

export async function popular() {
  return get("/trending");
}

export async function top(type) {
  return get(`/top/${type === "movie" ? "movies" : "shows"}`);
}

export async function history(user_id, type) {
  return post("/history", { id: user_id, type });
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

export async function discover(type, page, params = {}) {
  return post(`/${type}/discover`, { page, params });
}

export async function networkDetails(id) {
  return get(`/show/network/${id}`);
}

export async function companyDetails(id) {
  return get(`/movie/company/${id}`);
}

export async function guideCalendar() {
  return get("/services/calendar");
}

export let checkConfig = () => {
  return get("/config");
};

export async function discoveryMovies() {
  return get("/discovery/movies");
}

export async function discoveryShows() {
  return get("/discovery/shows");
}

export async function batchLookup(ids, type) {
  return post(`/batch/${type}`, { ids: ids });
}

export async function getInvitation(id) {
  return post(`/invitation`, { id });
}

export async function acceptInvitation(acceptedBy, invitCode) {
  return post(`/invitation/accept`, { acceptedBy, invitCode });
}
