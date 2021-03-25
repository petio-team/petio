import { store } from "../store";
import * as types from "../actionTypes";
import * as api from "./api";
import { initAuth } from "../auth";
import { validatePin, getPins } from "../Plex/api";

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

function deleteCookie(name) {
  if (getCookie(name)) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }
}

export function login(user, cookie = false) {
  return new Promise((resolve, reject) => {
    let authToken = false;
    if (cookie) {
      authToken = getCookie("petio_jwt");
    }

    api
      .login(user, authToken)
      .then((data) => {
        if (data.user) {
          if (data.loggedIn) {
            finalise({
              type: types.LOGIN,
              data: data,
            });
            resolve(data);
          } else {
            deleteCookie("petio_jwt");
            reject("User not found");
            return;
          }
        } else {
          deleteCookie("petio_jwt");
          reject("User not found");
        }
      })
      .catch((err) => {
        console.log(err);
        deleteCookie("petio_jwt");
        reject("An error has occured");
      });
  });
}

export function logout() {
  deleteCookie("petio_jwt");
  finalise({
    type: types.LOGOUT,
  });
  initAuth();
}

export async function plexAuth(plexWindow) {
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
  plexWindow.document.body.innerHTML = plex_oauth_loader;
  try {
    let pins = await getPins();
    console.log(pins);
    plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=df9e71a5-a6cd-488e-8730-aaa9195f7435&code=${pins.code}`;
    let data = await waitForPin(plexWindow, pins.id);
    return data;
  } catch (err) {
    throw err;
  }
}

async function waitForPin(plexWindow, id) {
  await timeout(1000);
  let response = await validatePin(id);
  if (response.authToken) {
    plexWindow.close();
    let data = await api.plexLogin(response.authToken);
    if (data.user) {
      let ls_user = data.token;
      if (data.loggedIn) {
        localStorage.setItem("petio_jwt", ls_user);
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
  } else if (plexWindow.closed) {
    return {
      error: "Plex window closed",
    };
  } else {
    return await waitForPin(plexWindow, id);
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function request(req, user) {
  return new Promise((resolve, reject) => {
    api
      .request(req, user)
      .then((data) => {
        if (data && !data.error) {
          resolve(
            finalise({
              type: types.GET_REQUESTS,
              requests: data,
            }),
            finalise({
              type: types.UPDATE_QUOTA,
              quota: data.quota,
            })
          );
        } else {
          if (data) {
            reject(data.message);
          } else {
            reject("API Connection error");
          }
        }
      })
      .catch((data) => {
        console.log(data);
        if (data) {
          reject(data.message);
        } else {
          reject("API Connection error");
        }
      });
  });
}

export function getRequests() {
  return new Promise((resolve, reject) => {
    api.getRequests().then((data) => {
      if (data && !data.error) {
        resolve(
          finalise({
            type: types.GET_REQUESTS,
            requests: data,
          })
        );
      } else {
        reject("Error");
      }
    });
  });
}

export function getReviews(id) {
  return new Promise((resolve, reject) => {
    api.getReviews(id).then((data) => {
      if (data && !data.error) {
        resolve(
          finalise({
            type: types.GET_REVIEWS,
            reviews: data,
            id: id,
          })
        );
      } else {
        reject("Error");
      }
    });
  });
}

export function addIssue(issue) {
  return new Promise((resolve, reject) => {
    api.addIssue(issue).then((data) => {
      if (data && !data.error) {
        resolve();
      } else {
        reject("Error");
      }
    });
  });
}

export async function myRequests() {
  try {
    let data = await api.myRequests();
    return data;
  } catch {
    return false;
  }
}

function finalise(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}

export function review(item, id, review) {
  api.review(item, id, review);
}

export async function quota() {
  try {
    let data = await api.quota();
    return data;
  } catch (err) {
    console.log(err);
    throw "Unable to get Quota";
  }
}
