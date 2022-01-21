import { store } from "../store";
import * as types from "../actionTypes";

function storeNav(path, state, scroll, carousels = []) {
  if (!state) state = {};
  state.getPos = true;
  store.dispatch({
    type: types.STORE_NAV,
    path: path,
    state: state,
    scroll: scroll,
    carousels: carousels,
  });
}

function clearNav() {
  store.dispatch({
    type: types.CLEAR_NAV,
  });
}

function getNav(path) {
  let state = store.getState();
  return state.nav.pages[path] || false;
}

export default { storeNav, getNav, clearNav };
