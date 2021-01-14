import { store } from "../store";
import * as types from "../actionTypes";

const PlexRequestApi =
  process.env.NODE_ENV === "development" ? "http://localhost:7778" : `${window.location.protocol}//${window.location.host}${window.location.pathname === "/" ? "" : window.location.pathname}/api`;

export function initAuth() {
  finalise({
    type: types.CREDENTIALS,
    credentials: {
      api: PlexRequestApi,
    },
  });
}

export function getAuth() {
  return store.getState().user.credentials;
}

function finalise(data = false) {
  if (!data) return false;
  return store.dispatch(data);
}
