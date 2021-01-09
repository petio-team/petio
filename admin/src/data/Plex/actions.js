import { store } from "../store";
import * as types from "../actionTypes";
import * as api from "./api";

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

export function plexAuth(plexWindow) {
  plexWindow.document.body.innerHTML = plex_oauth_loader;
  api
    .getPins()
    .then((response) => response.json())
    .then((res) => {
      plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=067e602b-1e86-4739-900d-1abdf8f6da71&code=${res.code}`;

      waitForPin(plexWindow, res.id);
    })
    .catch(() => {
      alert("Unable to open popout window, please make sure to allow pop-ups!");
    });
}

function saveToken(token) {
  finalise({
    type: types.PLEX_TOKEN,
    token: token,
  });
}

async function waitForPin(plexWindow, id) {
  let response = await api.validatePin(id);
  if (response.authToken) {
    plexWindow.close();
    saveToken(response.authToken);
    getUser(response.authToken);
  } else if (plexWindow.closed) {
    alert("Unable to login please try again");
  } else {
    setTimeout(() => {
      waitForPin(plexWindow, id);
    }, 1000);
  }
}

async function getUser(token) {
  let setup = {
    user: {},
    servers: {},
  };
  let user = await api.getUser(token);
  let servers = await api.getServers(token);
  let serverList = servers.getElementsByTagName("MediaContainer")[0].getElementsByTagName("Device");
  let userData = user.getElementsByTagName("user")[0];
  setup.user.email = userData.getAttribute("email");
  setup.user.id = userData.getAttribute("id");
  setup.user.username = userData.getAttribute("title");
  setup.user.thumb = userData.getAttribute("thumb");
  for (let server of serverList) {
    if (server.getAttribute("owned") === "1" && server.getAttribute("provides") === "server") {
      let connections = server.getElementsByTagName("Connection");
      for (let connection of connections) {
        console.log(connection);
        // if (connection.getAttribute('local') === '0')
        setup.servers[server.getAttribute("clientIdentifier")] = {
          name: server.getAttribute("name"),
          host: connection.getAttribute("address"),
          port: connection.getAttribute("port"),
          protocol: connection.getAttribute("protocol"),
          platform: server.getAttribute("platform"),
        };
      }
    }
  }
  finalise({
    type: types.PLEX_DETAILS,
    servers: setup.servers,
    user: setup.user,
  });
}

function finalise(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}
