// eslint-disable-next-line no-undef
const isDev = process.env.NODE_ENV === "development";
const origin = isDev ? "http://localhost:7778" : "";
const basePath = window.location.pathname.replace(/\/$/, "");
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

function parseResponse(response, type = "text") {
  if (response.ok) {
    return response
      .clone()
      .json()
      .catch(() => response.text());
  }
  console.log(new HttpError(response.status));

  return response
    .clone()
    .json()
    .catch(() => response[type]?.());
}

function handleResponse(response) {
  if (response.ok) {
    return response.clone().json();
  }

  return response.json().then((err) => {
    console.error(`[API ${response.status}]`, err);
    throw err;
  });
}

export function get(path, options = {}, handleType = "parse") {
  const mergedOptions = {
    credentials: "include",
    ...options,
    headers: {
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
  };
  return fetch(API_URL + path, mergedOptions).then((res) =>
    handleType === "parse" ? parseResponse(res) : handleResponse(res)
  );
}

export function post(path, data, options = {}, handleType = "parse") {
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
  return fetch(API_URL + path, mergedOptions).then((res) =>
    handleType === "parse" ? parseResponse(res) : handleResponse(res)
  );
}

export function put(path, data, options = {}, handleType = "parse") {
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
  return fetch(API_URL + path, mergedOptions).then((res) =>
    handleType === "parse" ? parseResponse(res) : handleResponse(res)
  );
}

export function del(path, options = {}, handleType = "parse") {
  const mergedOptions = {
    credentials: "include",
    method: "DELETE",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...maybeGetAuthHeader(),
      ...options.headers,
    },
  };
  return fetch(API_URL + path, mergedOptions).then((res) =>
    handleType === "parse" ? parseResponse(res) : handleResponse(res)
  );
}
