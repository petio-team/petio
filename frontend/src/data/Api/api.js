import { getAuth } from "../auth";

export async function popular() {
  let request = `${getAuth().api}/trending`;
  return process(request).then((res) => res.json());
}

export function top(type) {
  let request = `${getAuth().api}/top/shows`;
  if (type === "movie") {
    request = `${getAuth().api}/top/movies`;
  }
  return process(request).then((res) => res.json());
}

export function history(user_id, type) {
  let body = {
    id: user_id,
    type: type,
  };
  let headers = { "Content-Type": "application/json" };
  let request = `${getAuth().api}/history`;
  return process(request, headers, "post", body).then((res) => res.json());
}

export function get_plex_media(id, type) {
  let request = `${getAuth().api}/plex/lookup/${type}/${id}`;
  return process(request).then((res) => res.json());
}

export function movie(id = false, minified) {
  if (!id) {
    return false;
  }
  let request = `${getAuth().api}/movie/lookup/${id}`;
  if (minified) {
    request = `${getAuth().api}/movie/lookup/${id}/minified`;
  }
  return process(request).then((res) => res.json());
}

export function series(id = false, minified) {
  if (!id) {
    return false;
  }
  let request = `${getAuth().api}/show/lookup/${id}`;
  if (minified) {
    request = `${getAuth().api}/show/lookup/${id}/minified`;
  }
  return process(request).then((res) => res.json());
}

export function person(id = false, name = false) {
  if (!id) {
    return false;
  }
  let request = `${getAuth().api}/person/lookup/${id}`;
  return process(request).then((res) => res.json());
}

export async function search(title = false) {
  let request = `${getAuth().api}/search/${encodeURI(title)}`;
  return process(request).then((res) => res.json());
}

export function actor(id = false) {
  if (!id) {
    return false;
  }
  let request = `${getAuth().api}/person/lookup/${id}`;
  return process(request).then((res) => res.json());
}

export let checkConfig = () => {
  let request = `${getAuth().api}/config`;
  return process(request).then((res) => res.json());
};

function process(url, headers, method, body = null) {
  let args = {
    method: method,
    headers: headers,
  };

  if (method === "post") {
    args.body = JSON.stringify(body);
  }

  return fetch(url, args);
}
