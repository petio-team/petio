import { post } from "../http";

const plexHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Plex-Device": "API",
  "X-Plex-Device-Name": "Petio",
  "X-Plex-Product": "Petio",
  "X-Plex-Version": "v1.0",
  "X-Plex-Platform-Version": "v1.0",
  "X-Plex-Client-Identifier": "fc684eb1-cdff-46cc-a807-a3720696ae9f",
};

export function getPins() {
  let url = "https://plex.tv/api/v2/pins?strong=true";
  let method = "post";
  let headers = plexHeaders;
  return process(url, headers, method).then((response) => response.json());
}

export function validatePin(id) {
  let url = `https://plex.tv/api/v2/pins/${id}`;
  let method = "get";
  let headers = plexHeaders;
  return process(url, headers, method).then((response) => response.json());
}

export function getUser(token) {
  let url = `https://plex.tv/users/account?X-Plex-Token=${token}`;
  let method = "get";
  let headers = plexHeaders;
  return process(url, headers, method)
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"));
}

export function getServers(token, ssl = false) {
  let url = `https://plex.tv/pms/resources?${
    ssl ? "includeHttps=1&" : ""
  }X-Plex-Token=${token}`;
  let method = "get";
  let headers = plexHeaders;
  return process(url, headers, method)
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"));
}

export async function plexLogin(token = false) {
  return post("/login/plex_login", { token: token });
}

function process(url, headers, method, body = null) {
  let args = {
    method: method,
    headers: headers,
  };

  if (method === "post") {
    args.body = body;
  }

  return fetch(url, args);
}
