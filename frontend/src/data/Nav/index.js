import { store } from "../store";
import * as types from "../actionTypes";

function storeNav(path, state, scroll) {
  store.dispatch({
    type: types.STORE_NAV,
    path: path,
    state: state,
    scroll: scroll,
  });
}

export default { storeNav };
