const isDev = process.env.NODE_ENV === "development";
const origin = isDev ? "http://localhost:7778" : "";
const basePath = isDev
  ? ""
  : window.location.pathname.replace(/\/admin\/$/, "");
const API_URL = `${origin}${basePath}${isDev ? "" : "/api"}`;

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function maybeGetAuthHeader() {
  let petioJwt = getCookie("petio_jwt");
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
  } else if (response.status === 401) {
    console.log();
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

export function upload(path, data, options = {}) {
  const mergedOptions = {
    credentials: "include",
    method: "POST",
    ...options,
    headers: {
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
    body: data,
  };
  return fetch(API_URL + path, mergedOptions).then(parseResponse);
}
