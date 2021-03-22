const isDev = process.env.NODE_ENV === "development";
const origin = isDev ? "http://localhost:7778" : "";
const basePath = window.location.pathname.replace(/\/$/, "");
const API_URL = `${origin}${basePath}${isDev ? "" : "/api"}`;

function maybeGetAuthHeader() {
  let petioJwt = localStorage.getItem("petio_jwt");
  if (petioJwt) {
    return { Authorization: `Bearer ${petioJwt}` };
  } else {
    return {};
  }
}

export class HttpError extends Error {
  constructor(statusCode) {
    super(`API returned status code ${statusCode}`);
    this.statusCode = statusCode;
  }
}

function parseResponse(response) {
  if (response.ok) {
    return response
      .clone()
      .json()
      .catch(() => response.text());
  }
  console.log(new HttpError(response.status));
}

export function get(path, options = {}) {
  const mergedOptions = {
    credentials: "include",
    ...options,
    headers: {
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
  };
  return fetch(API_URL + path, mergedOptions).then(parseResponse);
}

export function post(path, data, options = {}) {
  const mergedOptions = {
    credentials: "include",
    method: "POST",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
    body: JSON.stringify(data),
  };
  return fetch(API_URL + path, mergedOptions).then(parseResponse);
}

export function put(path, data, options = {}) {
  const mergedOptions = {
    credentials: "include",
    method: "PUT",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
    body: JSON.stringify(data),
  };
  return fetch(API_URL + path, mergedOptions).then(parseResponse);
}

export function del(path, options = {}) {
  const mergedOptions = {
    credentials: "include",
    method: "DELETE",
    ...options,
    headers: {
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
  };
  return fetch(API_URL + path, mergedOptions).then(parseResponse);
}
