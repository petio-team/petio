import cookies from 'js-cookie';

import { get, post } from '../helpers';
import store from '../redux/store.js';

// user actions

export function logout() {
  cookies.remove('petio_jwt');
  updateStore({
    type: 'user/logout',
  });
  if (typeof window !== 'undefined') window.location.reload();
}

export function getToken() {
  return cookies.get('petio_jwt');
}

export function clearToken() {
  cookies.set('petio_jwt', '', { expires: new Date(0) });
}

export async function login(user, token = false) {
  if (!user && !token) throw new Error('User not supplied');
  const login = await post('/login', { user, authToken: false });
  if (!login.loggedIn) throw new Error('Invalid login credentials');
  updateStore({
    type: 'user/set-current-user',
    user: login.user,
    admin: login.admin,
  });
  return login;
}

export async function getRequests(min = true) {
  try {
    const data = await get(`/request/${min ? 'min' : 'all'}`);
    updateStore({ type: 'user/update-requests', requests: data });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function myRequests() {
  try {
    const data = await get('/request/me');
    if (data.status !== 'success') {
      return;
    }
    updateStore({ type: 'user/my-requests', requests: data.data });
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
      type: 'user/my-requests-archive',
      requests: data.requests,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function addNewRequest(req, user) {
  return post('/request/add', { request: req, user });
}

export function updateRequest(request, servers) {
  return post(`/request/update`, { request, servers });
}

export async function saveReview(item, id, review) {
  let itemMin = {
    title: item.title ? item.title : item.name,
    type: item.episode_run_time ? 'tv' : 'movie',
    thumb: item.poster_path,
    id: item.id,
  };
  return post('/review/add', {
    item: itemMin,
    user: id,
    review: { score: review },
  });
}

export async function getReviews() {
  try {
    const data = await get(`/review/all`);
    updateStore({
      type: 'user/all-reviews',
      reviews: data,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function getUserQuota() {
  try {
    const data = await get('/user/quota');
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function watchHistory(user_id, type) {
  try {
    const data = await post('/history', { id: user_id, type });
    updateStore({
      type: 'user/watch-history',
      history: data,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export async function allUsers() {
  try {
    const data = await get(`/user/all`);
    updateStore({
      type: 'user/all-users',
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

export function getProfiles() {
  return get(`/profiles/all`);
}

export async function addIssue(issue) {
  return post('/issue/add', issue);
}

export async function getIssues() {
  try {
    const data = await get(`/issue/all`);
    updateStore({
      type: 'user/all-issues',
      issues: data,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

function updateStore(data = {}) {
  if (Object.keys(data).length === 0) return false;
  return store.dispatch(data);
}
