import { store } from "../store";
import * as types from "../actionTypes";
import * as api from "./api";
import { testServer, updateConfig } from "../Api/api";

// Credit Tautulli
const plex_oauth_loader =
  "<style>" +
  ".login-loader-container {" +
  'font-family: "Open Sans", Arial, sans-serif;' +
  "position: absolute;" +
  "top: 0;" +
  "right: 0;" +
  "bottom: 0;" +
  "left: 0;" +
  "}" +
  ".login-loader-message {" +
  "color: #282A2D;" +
  "text-align: center;" +
  "position: absolute;" +
  "left: 50%;" +
  "top: 25%;" +
  "transform: translate(-50%, -50%);" +
  "}" +
  ".login-loader {" +
  "border: 5px solid #ccc;" +
  "-webkit-animation: spin 1s linear infinite;" +
  "animation: spin 1s linear infinite;" +
  "border-top: 5px solid #282A2D;" +
  "border-radius: 50%;" +
  "width: 50px;" +
  "height: 50px;" +
  "position: relative;" +
  "left: calc(50% - 25px);" +
  "}" +
  "@keyframes spin {" +
  "0% { transform: rotate(0deg); }" +
  "100% { transform: rotate(360deg); }" +
  "}" +
  "</style>" +
  '<div class="login-loader-container">' +
  '<div class="login-loader-message">' +
  '<div class="login-loader"></div>' +
  "<br>" +
  "Redirecting to the Plex login page..." +
  "</div>" +
  "</div>";

export async function plexAuth(plexWindow) {
  plexWindow.document.body.innerHTML = plex_oauth_loader;
  let pins = await api.getPins();
  plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=fc684eb1-cdff-46cc-a807-a3720696ae9f&code=${pins.code}`;
  let data = await waitForPin(plexWindow, pins.id, true, false);
  return data;
}

export async function plexLogin(plexWindow) {
  plexWindow.document.body.innerHTML = plex_oauth_loader;
  let pins = await api.getPins();
  plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=fc684eb1-cdff-46cc-a807-a3720696ae9f&code=${pins.code}`;
  let data = await waitForPin(plexWindow, pins.id, false, true);
  return data;
}

export async function plexToken(plexWindow) {
  plexWindow.document.body.innerHTML = plex_oauth_loader;
  let pins = await api.getPins();
  plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=fc684eb1-cdff-46cc-a807-a3720696ae9f&code=${pins.code}`;
  let data = await waitForPin(plexWindow, pins.id);
  return data;
}

function saveToken(token) {
  finalise({
    type: types.PLEX_TOKEN,
    token: token,
  });
}

async function waitForPin(plexWindow, id, setup = false, login = false) {
  await timeout(1000);
  let response = await api.validatePin(id);
  if (response.authToken) {
    plexWindow.close();
    if (setup) {
      saveToken(response.authToken);
      getUser(response.authToken);
    } else if (login) {
      let data = await api.plexLogin(response.authToken);
      if (data.user) {
        if (data.loggedIn) {
          finalise({
            type: types.LOGIN,
            data: data,
          });
          return data;
        } else {
          return {
            error: "User not found",
          };
        }
      } else {
        return {
          error: "User not found",
        };
      }
    } else {
      saveToken(response.authToken);
      finalise({
        type: types.PLEX_TOKEN,
        token: false,
      });
      updateConfig({
        plexToken: response.authToken,
      });
      location.reload();
    }
  } else if (plexWindow.closed) {
    return {
      error: "Plex window closed",
    };
  } else {
    return await waitForPin(plexWindow, id, setup, login);
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getUser(token) {
  let setup = {
    user: {},
    servers: {},
  };
  let user = await api.getUser(token);
  let [servers, serversSsl] = await Promise.all([
    api.getServers(token),
    api.getServers(token, true),
  ]);
  let serverList = Array.prototype.slice.call(
    servers
      .getElementsByTagName("MediaContainer")[0]
      .getElementsByTagName("Device")
  );
  let serverListSsl = Array.prototype.slice.call(
    serversSsl
      .getElementsByTagName("MediaContainer")[0]
      .getElementsByTagName("Device")
  );
  Array.prototype.push.apply(serverList, serverListSsl);
  let userData = user.getElementsByTagName("user")[0];
  setup.user.email = userData.getAttribute("email");
  setup.user.id = userData.getAttribute("id");
  setup.user.username = userData.getAttribute("title");
  setup.user.thumb = userData.getAttribute("thumb");
  for (let server of serverList) {
    let i = 0;
    if (
      server.getAttribute("owned") === "1" &&
      server.getAttribute("provides") === "server"
    ) {
      let connections = server.getElementsByTagName("Connection");

      for (let connection of connections) {
        console.log(connection);
        let uri = connection.getAttribute("uri");
        let details = getUrlDetails(uri);
        setup.servers[
          server.getAttribute("clientIdentifier") + details.hostname + i
        ] = {
          name: server.getAttribute("name"),
          host: details.hostname,
          port: details.port,
          protocol: details.protocol,
          platform: server.getAttribute("platform"),
          status: "pending",
          clientId: server.getAttribute("clientIdentifier"),
        };
        i++;
      }
    }
  }
  setup.servers["plex_docker"] = {
    name: "Docker",
    host: "plex",
    port: "32400",
    protocol: "http",
    platform: "docker",
    status: "pending",
  };
  console.log(setup.servers);
  finalise({
    type: types.PLEX_DETAILS,
    servers: setup.servers,
    user: setup.user,
  });

  testPlexServers(setup.servers, token);
}

function testPlexServers(servers, token) {
  Object.keys(servers).map((key) => {
    let server = servers[key];
    server.token = token;
    testPlexServer(server, key);
  });
}

async function testPlexServer(server, key) {
  try {
    let test = await testServer(server);
    console.log(test);
    server.status = test.status;
    finalise({
      type: types.PLEX_SERVER,
      key: key,
      server: server,
    });
  } catch {
    server.status = "failed";
    finalise({
      type: types.PLEX_SERVER,
      key: key,
      server: server,
    });
  }
}

function finalise(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}

function getUrlDetails(url) {
  var a = document.createElement("a");
  a.href = url;
  return {
    protocol: a.protocol.replace(":", ""),
    hostname: a.hostname,
    port: a.port,
  };
}
