import { get, post } from "../helpers";
import cookies from "js-cookie";
import store from "../redux/store.js";

// user actions

export function logout() {
  cookies.remove("petio_jwt");
  updateStore({
    type: "user/logout",
  });
  if (typeof window !== undefined) window.location.reload();
}

export function getToken() {
  return cookies.get("petio_jwt");
}

export function clearToken() {
  cookies.set("petio_jwt", "", { expires: new Date(0) });
}

export async function login(user, token = false) {
  if (!user && !token) throw "User not supplied";
  try {
    const login = await post("/login", { user, authToken: false });
    if (!login.loggedIn) throw "Invalid login credentials";
    updateStore({
      type: "user/set-current-user",
      user: login.user,
      admin: login.admin,
    });
    return login;
  } catch (e) {
    throw e;
  }
}

export async function getRequests(min = true) {
  try {
    const data = await get(`/request/${min ? "min" : "all"}`);
    updateStore({ type: "user/update-requests", requests: data });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function myRequests() {
  try {
    const data = await get("/request/me");
    updateStore({ type: "user/my-requests", requests: data });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function myRequestsArchive(id) {
  if (!id) return;
  try {
    const data = await get(`/request/archive/${id}`);
    updateStore({
      type: "user/my-requests-archive",
      requests: data.requests,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function addNewRequest(req, user) {
  return post("/request/add", { request: req, user });
}

export async function saveReview(item, id, review) {
  let itemMin = {
    title: item.title ? item.title : item.name,
    type: item.episode_run_time ? "tv" : "movie",
    thumb: item.poster_path,
    id: item.id,
  };
  return post("/review/add", {
    item: itemMin,
    user: id,
    review: { score: review },
  });
}

export async function getReviews() {
  try {
    const data = await get(`/review/all`);
    updateStore({
      type: "user/all-reviews",
      reviews: data,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function getUserQuota() {
  try {
    const data = await get("/user/quota");
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function watchHistory(user_id, type) {
  return post("/history", { id: user_id, type });
}

export async function allUsers() {
  try {
    const data = await get(`/user/all`);
    updateStore({
      type: "user/all-users",
      users: data,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export function deleteRequest(request, reason) {
  return post(`/request/remove`, { request, reason });
}

function updateStore(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}
