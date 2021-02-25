import { get, post } from "../http";

export async function login(user, token = false) {
  return post("/login", { user, authToken: token });
}

export async function request(req, user) {
  return post("/request/add", { request: req, user });
}

export async function review(item, id, review) {
  let itemMin = {
    title: item.title ? item.title : item.name,
    type: item.episode_run_time ? "tv" : "movie",
    thumb: item.thumb,
    id: item.id,
  };
  return post("/review/add", {
    item: itemMin,
    user: id,
    review: review,
  });
}

export async function getRequests() {
  return get("/request/min");
}

export async function getReviews(id) {
  if (!id) return Promise.resolve();
  return get(`/review/all/${id}`);
}

export async function addIssue(issue) {
  return post("/issue/add", issue);
}

export async function myRequests() {
  return get("/request/me");
}
