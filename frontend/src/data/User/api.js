import { getAuth } from "../auth";

export async function login(username, token = false) {
  let IP = await getIP();
  console.log(IP);
  let request = `${getAuth().api}/login`;
  let headers = {
    "Content-Type": "application/json",
  };
  return process(request, "post", headers, {
    username: username,
    authToken: token,
    ip: IP.ip,
  }).then((res) => res.json());
}

function getIP() {
  return fetch("https://jsonip.com", { mode: "cors" }).then((resp) => resp.json());
}

export let request = (req, user) => {
  let request = `${getAuth().api}/request/add`;
  let headers = {
    "Content-Type": "application/json",
  };
  return process(request, "post", headers, {
    request: req,
    user: user,
  }).then((res) => res.json());
};

export let review = (item, id, review) => {
  let request = `${getAuth().api}/review/add`;
  let headers = {
    "Content-Type": "application/json",
  };
  let itemMin = {
    title: item.title,
    thumb: item.thumb,
    id: item.id,
  };
  return process(request, "post", headers, {
    item: itemMin,
    user: id,
    review: review,
  }).then((res) => res.json());
};

export let getRequests = () => {
  let request = `${getAuth().api}/request/min`;
  let headers = {
    "Content-Type": "application/json",
  };
  return process(request, "get", headers).then((res) => res.json());
};

export let getReviews = (id) => {
  if (!id) return;
  let request = `${getAuth().api}/review/all/${id}`;
  let headers = {
    "Content-Type": "application/json",
  };
  return process(request, "get", headers).then((res) => res.json());
};

export let addIssue = (issue) => {
  let request = `${getAuth().api}/issue/add`;
  let headers = {
    "Content-Type": "application/json",
  };
  return process(request, "post", headers, issue).then((res) => res.json());
};

function process(url, method, headers, body = null) {
  let args = {
    headers: headers,
    method: method,
  };

  if (method === "post") {
    args.body = JSON.stringify(body);
  }

  return fetch(url, args);
}
