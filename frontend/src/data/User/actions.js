import { store } from "../store";
import * as types from "../actionTypes";
import * as api from "./api";
import { initAuth } from "../auth";

export function login(user, cookie = false) {
  return new Promise((resolve, reject) => {
    let authToken = false;
    if (cookie) {
      authToken = localStorage.getItem("petio_jwt");
    }

    api
      .login(user, authToken)
      .then((data) => {
        if (data.user) {
          let ls_user = data.token;
          if (data.loggedIn) {
            if (!cookie) {
              localStorage.setItem("petio_jwt", ls_user);
            }
            finalise({
              type: types.LOGIN,
              data: data,
            });
            resolve(data);
          } else {
            reject("User not found");
            return;
          }
        } else {
          reject("User not found");
        }
      })
      .catch((err) => {
        console.log(err);
        reject("An error has occured");
      });
  });
}

export function logout() {
  finalise({
    type: types.LOGOUT,
  });
  initAuth();
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

export async function discoveryMovies() {
  try {
    let data = await api.discoveryMovies();
    return data;
  } catch (err) {
    console.log(err);
    throw "Unable to get Discovery Movies";
  }
}
