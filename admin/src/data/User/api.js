const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:7778" : `${window.location.protocol}//${window.location.host}${window.location.pathname.replace("/admin/", "")}/api`;

export async function login(username, password, admin = false, token = false) {
  let IP = await getIP();
  let request = `${apiUrl}/login`;
  let headers = {
    "Content-Type": "application/json",
  };
  return call(request, "post", headers, {
    username: username,
    password: password,
    admin: admin,
    authToken: token,
    ip: IP.ip,
  }).then((res) => res.json());
}

function getIP() {
  return fetch("https://jsonip.com", { mode: "cors" }).then((resp) => resp.json());
}

export let getRequests = () => {
  let request = `${apiUrl}/request/all`;
  let headers = {
    "Content-Type": "application/json",
  };
  return call(request, "get", headers).then((res) => res.json());
};

function call(url, method, headers, body = null) {
  let args = {
    headers: headers,
    method: method,
  };

  if (method === "post") {
    args.body = JSON.stringify(body);
  }

  return fetch(url, args);
}
