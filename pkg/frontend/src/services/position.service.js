import store from "../redux/store.js";

export function storePosition(path, scrollPos, carousels = {}, state = false) {
  updateStore({
    type: "pos/store",
    path: path,
    scroll: scrollPos,
    carousels: carousels,
    state: state,
  });
}

export function resetScrollPosition() {
  updateStore({
    type: "pos/clear",
  });
}

function updateStore(data = {}) {
  if (Object.keys(data).length === 0) return false;
  return store.dispatch(data);
}
